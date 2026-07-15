import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Nav, NavItem, NavLink, Input, Label, Table,
} from "reactstrap";
import classnames from "classnames";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import { STATUS_BADGE, ORDER_TYPES, ORDER_TYPES_REQUIRING_TABLE } from "../../common/orderConstants";
import { getSalesReport, getMenuPerformanceReport, getLowStockReport, getOrders } from "../../helpers/backend_helper";

const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "custom", label: "Custom" },
];
const CHART_COLOR = "#00473c"; // Deep Forest, matches the app-wide primary color

const toDateStr = (d) => d.toISOString().slice(0, 10);

const chartOptions = (categories) => ({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
  dataLabels: { enabled: false },
  xaxis: { categories },
  colors: [CHART_COLOR],
});

const Dashboard = () => {
  document.title = "Dashboard | RMS";

  const [datePreset, setDatePreset] = useState("last7");
  const [customFrom, setCustomFrom] = useState(toDateStr(new Date(Date.now() - 7 * 86400000)));
  const [customTo, setCustomTo] = useState(toDateStr(new Date()));

  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const { from, to } = useMemo(() => {
    const now = new Date();
    if (datePreset === "today") return { from: toDateStr(now), to: toDateStr(now) };
    if (datePreset === "last7") return { from: toDateStr(new Date(now - 7 * 86400000)), to: toDateStr(now) };
    if (datePreset === "last30") return { from: toDateStr(new Date(now - 30 * 86400000)), to: toDateStr(now) };
    return { from: customFrom, to: customTo };
  }, [datePreset, customFrom, customTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const [salesRes, menuRes, lowStockRes] = await Promise.all([
          getSalesReport({ range: "daily", from, to }),
          getMenuPerformanceReport({ sort: "best", from, to, limit: 5 }),
          getLowStockReport(),
        ]);
        if (cancelled) return;
        setSales(salesRes);
        setPopularItems(menuRes.items);
        setLowStock(lowStockRes.items);
      } catch (e) {
        if (!cancelled) toast.error(typeof e === "string" ? e : "Failed to load dashboard data", { autoClose: 3000 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      try {
        const res = await getOrders();
        if (cancelled) return;
        const sorted = [...res.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sorted.slice(0, 5));
      } catch (e) {
        if (!cancelled) toast.error(typeof e === "string" ? e : "Failed to load recent orders", { autoClose: 3000 });
      }
    };
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Dashboard" pageTitle="RMS" />

        <Row className="mb-3">
          <Col>
            <Nav pills>
              {DATE_PRESETS.map((preset) => (
                <NavItem key={preset.key}>
                  <NavLink
                    href="#"
                    className={classnames({ active: datePreset === preset.key })}
                    onClick={() => setDatePreset(preset.key)}
                  >
                    {preset.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            {datePreset === "custom" ? (
              <div className="d-flex gap-2 align-items-center mt-2">
                <Label className="mb-0 fs-13 text-muted">From</Label>
                <Input type="date" style={{ width: 170 }} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                <Label className="mb-0 fs-13 text-muted">To</Label>
                <Input type="date" style={{ width: 170 }} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            ) : null}
          </Col>
        </Row>

        {loading ? <p className="text-muted">Loading dashboard&hellip;</p> : null}

        <Row className="g-3">
          <Col md={5}>
            <Card>
              <CardBody>
                <h2 className="mb-0">{sales ? sales.totalOrders : "—"}</h2>
                <p className="text-muted mb-3">COMPLETED ORDERS</p>
                {sales
                  ? sales.byOrderType.map((t) => {
                      const meta = ORDER_TYPES.find((ot) => ot.value === t.orderType);
                      return (
                        <div className="d-flex align-items-center justify-content-between mb-2" key={t.orderType}>
                          <span>
                            <i className={`mdi mdi-circle text-${meta?.color || "secondary"} me-1`}></i>
                            {t.orderType}
                          </span>
                          <span className="fw-semibold">
                            {t.count} <span className="text-muted fw-normal">{t.percentage}%</span>
                          </span>
                        </div>
                      );
                    })
                  : null}
                {sales && sales.byOrderType.length === 0 ? (
                  <p className="text-muted mb-0">No completed orders in this range.</p>
                ) : null}
              </CardBody>
            </Card>
          </Col>
          <Col md={7}>
            <Card>
              <CardHeader>
                <h6 className="card-title mb-0">Orders This Period</h6>
              </CardHeader>
              <CardBody>
                {sales && sales.buckets.length > 0 ? (
                  <ReactApexChart
                    options={chartOptions(sales.buckets.map((b) => b.date))}
                    series={[{ name: "Orders", data: sales.buckets.map((b) => b.orderCount) }]}
                    type="bar"
                    height={220}
                  />
                ) : (
                  <p className="text-muted mb-0">No data for this range.</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-0">
          <Col md={6}>
            <Card>
              <CardHeader>
                <h6 className="card-title mb-0">Popular Items</h6>
              </CardHeader>
              <CardBody>
                {popularItems.length === 0 ? (
                  <p className="text-muted mb-0">No sales data for this range.</p>
                ) : (
                  <div className="table-responsive">
                    <Table className="align-middle table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Category</th>
                          <th className="text-end">Qty Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {popularItems.map((item) => (
                          <tr key={item.menuItemId}>
                            <td>{item.name}</td>
                            <td>{item.categoryName}</td>
                            <td className="text-end">{item.quantitySold}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardHeader>
                <h6 className="card-title mb-0">Low Stock Alerts</h6>
              </CardHeader>
              <CardBody>
                {lowStock.length === 0 ? (
                  <p className="text-muted mb-0">All inventory levels are healthy.</p>
                ) : (
                  <div className="table-responsive">
                    <Table className="align-middle table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th className="text-end">Quantity</th>
                          <th className="text-end">Threshold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStock.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td className="text-end">
                              <span className="badge bg-danger-subtle text-danger">
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td className="text-end text-muted">{item.reorderThreshold} {item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card className="mt-3">
          <CardHeader className="d-flex align-items-center justify-content-between">
            <h6 className="card-title mb-0">Recent Orders</h6>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <Table className="align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>Order</th>
                    <th>Table</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>#{order.id}</td>
                      <td>{ORDER_TYPES_REQUIRING_TABLE.includes(order.orderType) ? (order.table?.name ?? "—") : order.orderType}</td>
                      <td>
                        <span className={`badge bg-${STATUS_BADGE[order.status] || "secondary"}-subtle text-${STATUS_BADGE[order.status] || "secondary"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.payment?.method ?? "—"}</td>
                      <td>RM {Number(order.total).toFixed(2)}</td>
                      <td>{order.createdBy?.name ?? "—"}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">No orders yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Dashboard;
