import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Nav, NavItem, NavLink, Table, Input, Label,
} from "reactstrap";
import classnames from "classnames";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import {
  getSalesReport, getMenuPerformanceReport, getLowStockReport, getConsumptionReport,
  getWasteReport, getStaffSalesReport, getKitchenPerformanceReport,
} from "../../helpers/backend_helper";
import { exportToCsv } from "../../common/csvExport";

const TABS = ["Sales", "Menu", "Inventory", "Waste", "Staff", "Kitchen"];
const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "custom", label: "Custom" },
];
const CHART_COLOR = "#00473c"; // Deep Forest, matches the app-wide primary color

const toDateStr = (d) => d.toISOString().slice(0, 10);

const barChartOptions = (categories) => ({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
  dataLabels: { enabled: false },
  xaxis: { categories },
  colors: [CHART_COLOR],
});

const ExportButton = ({ rows, filename }) => (
  <button
    type="button"
    className="btn btn-sm btn-outline-secondary"
    disabled={!rows || rows.length === 0}
    onClick={() => exportToCsv(filename, rows)}
    title="Export CSV"
  >
    <i className="ri-download-2-line align-bottom me-1"></i> Export
  </button>
);

const Reports = () => {
  document.title = "Reports | RMS";
  const [activeTab, setActiveTab] = useState("Sales");
  const [datePreset, setDatePreset] = useState("last7");
  const [customFrom, setCustomFrom] = useState(toDateStr(new Date(Date.now() - 7 * 86400000)));
  const [customTo, setCustomTo] = useState(toDateStr(new Date()));

  const [salesRange, setSalesRange] = useState("daily");
  const [menuSort, setMenuSort] = useState("best");
  const [wasteRange, setWasteRange] = useState("daily");
  const [kitchenRange, setKitchenRange] = useState("daily");

  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState(null);
  const [menuPerf, setMenuPerf] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [consumption, setConsumption] = useState(null);
  const [waste, setWaste] = useState(null);
  const [staffSales, setStaffSales] = useState(null);
  const [kitchenPerf, setKitchenPerf] = useState(null);

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
        if (activeTab === "Sales") {
          const res = await getSalesReport({ range: salesRange, from, to });
          if (!cancelled) setSales(res);
        } else if (activeTab === "Menu") {
          const res = await getMenuPerformanceReport({ sort: menuSort, from, to, limit: 10 });
          if (!cancelled) setMenuPerf(res);
        } else if (activeTab === "Inventory") {
          const [low, cons] = await Promise.all([getLowStockReport(), getConsumptionReport({ from, to })]);
          if (!cancelled) {
            setLowStock(low);
            setConsumption(cons);
          }
        } else if (activeTab === "Waste") {
          const res = await getWasteReport({ range: wasteRange, from, to });
          if (!cancelled) setWaste(res);
        } else if (activeTab === "Staff") {
          const res = await getStaffSalesReport({ from, to });
          if (!cancelled) setStaffSales(res);
        } else if (activeTab === "Kitchen") {
          const res = await getKitchenPerformanceReport({ range: kitchenRange, from, to });
          if (!cancelled) setKitchenPerf(res);
        }
      } catch (e) {
        if (!cancelled) toast.error(typeof e === "string" ? e : "Failed to load report", { autoClose: 3000 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, from, to, salesRange, menuSort, wasteRange, kitchenRange]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Reports" pageTitle="Operations" />

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

        <Nav tabs className="nav-tabs-custom mb-3">
          {TABS.map((tab) => (
            <NavItem key={tab}>
              <NavLink
                href="#"
                className={classnames({ active: activeTab === tab })}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        {loading ? <p className="text-muted">Loading report&hellip;</p> : null}

        {activeTab === "Sales" && sales ? (
          <>
            <Row className="g-3 mb-3">
              <Col md={3}>
                <Card><CardBody><h4 className="mb-0">RM {sales.totalRevenue.toFixed(2)}</h4><p className="text-muted mb-0">Total Revenue</p></CardBody></Card>
              </Col>
              <Col md={3}>
                <Card><CardBody><h4 className="mb-0">{sales.totalOrders}</h4><p className="text-muted mb-0">Completed Orders</p></CardBody></Card>
              </Col>
              <Col md={3}>
                <Card><CardBody><h4 className="mb-0">{sales.refundedCount}</h4><p className="text-muted mb-0">Refunded Orders</p></CardBody></Card>
              </Col>
              <Col md={3}>
                <Card><CardBody><h4 className="mb-0">RM {sales.refundedAmount.toFixed(2)}</h4><p className="text-muted mb-0">Refunded Amount</p></CardBody></Card>
              </Col>
            </Row>
            <Row className="g-3">
              <Col lg={8}>
                <Card>
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <h6 className="card-title mb-0">Revenue by {salesRange === "daily" ? "Day" : salesRange === "weekly" ? "Week" : "Month"}</h6>
                    <div className="d-flex gap-1">
                      {["daily", "weekly", "monthly"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`btn btn-sm ${salesRange === r ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setSalesRange(r)}
                        >
                          {r[0].toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                      <ExportButton rows={sales.buckets} filename={`sales-${salesRange}-${from}-to-${to}.csv`} />
                    </div>
                  </CardHeader>
                  <CardBody>
                    {sales.buckets.length === 0 ? (
                      <p className="text-muted mb-0">No completed orders in this range.</p>
                    ) : (
                      <ReactApexChart
                        options={barChartOptions(sales.buckets.map((b) => b.date))}
                        series={[{ name: "Revenue (RM)", data: sales.buckets.map((b) => b.revenue) }]}
                        type="bar"
                        height={280}
                      />
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <h6 className="card-title mb-0">By Order Type</h6>
                    <ExportButton rows={sales.byOrderType} filename={`sales-by-order-type-${from}-to-${to}.csv`} />
                  </CardHeader>
                  <CardBody>
                    {sales.byOrderType.map((t) => (
                      <div key={t.orderType} className="d-flex justify-content-between mb-2">
                        <span>{t.orderType}</span>
                        <span className="fw-semibold">{t.count} <span className="text-muted fw-normal">({t.percentage}%)</span></span>
                      </div>
                    ))}
                    {sales.byOrderType.length === 0 ? <p className="text-muted mb-0">No data.</p> : null}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        ) : null}

        {activeTab === "Menu" && menuPerf ? (
          <Card>
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">{menuSort === "best" ? "Best" : "Worst"} Selling Items</h6>
              <div className="d-flex gap-1">
                <button type="button" className={`btn btn-sm ${menuSort === "best" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setMenuSort("best")}>Best</button>
                <button type="button" className={`btn btn-sm ${menuSort === "worst" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setMenuSort("worst")}>Worst</button>
                <ExportButton
                  rows={menuPerf.items.map((item, idx) => ({ rank: idx + 1, ...item }))}
                  filename={`menu-${menuSort}-selling-${from}-to-${to}.csv`}
                />
              </div>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <Table className="align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr><th>#</th><th>Item</th><th>Category</th><th>Qty Sold</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    {menuPerf.items.map((item, idx) => (
                      <tr key={item.menuItemId}>
                        <td>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.categoryName}</td>
                        <td>{item.quantitySold}</td>
                        <td>RM {item.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {menuPerf.items.length === 0 ? <p className="text-muted mt-2 mb-0">No completed orders in this range.</p> : null}
              </div>
            </CardBody>
          </Card>
        ) : null}

        {activeTab === "Inventory" && lowStock && consumption ? (
          <Row className="g-3">
            <Col lg={5}>
              <Card>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="card-title mb-0">Low Stock</h6>
                  <ExportButton rows={lowStock.items} filename="low-stock.csv" />
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <Table className="align-middle table-nowrap mb-0">
                      <thead className="table-light"><tr><th>Item</th><th>Category</th><th>Qty</th><th>Threshold</th></tr></thead>
                      <tbody>
                        {lowStock.items.map((i) => (
                          <tr key={i.id}>
                            <td>{i.name}</td>
                            <td>{i.category}</td>
                            <td>{i.quantity} {i.unit}</td>
                            <td>{i.reorderThreshold} {i.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {lowStock.items.length === 0 ? <p className="text-muted mt-2 mb-0">Nothing is low on stock.</p> : null}
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={7}>
              <Card>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="card-title mb-0">Consumption</h6>
                  <ExportButton rows={consumption.items} filename={`consumption-${from}-to-${to}.csv`} />
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <Table className="align-middle table-nowrap mb-0">
                      <thead className="table-light"><tr><th>Item</th><th>Used</th><th>Wasted</th><th>Cost</th></tr></thead>
                      <tbody>
                        {consumption.items.map((i) => (
                          <tr key={i.inventoryItemId}>
                            <td>{i.name}</td>
                            <td>{i.totalUsed} {i.unit}</td>
                            <td>{i.totalWasted} {i.unit}</td>
                            <td>RM {i.cost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {consumption.items.length === 0 ? <p className="text-muted mt-2 mb-0">No stock movement in this range.</p> : null}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        ) : null}

        {activeTab === "Waste" && waste ? (
          <Row className="g-3">
            <Col lg={7}>
              <Card>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="card-title mb-0">Waste by {wasteRange === "daily" ? "Day" : "Month"}</h6>
                  <div className="d-flex gap-1">
                    {["daily", "monthly"].map((r) => (
                      <button key={r} type="button" className={`btn btn-sm ${wasteRange === r ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setWasteRange(r)}>
                        {r[0].toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                    <ExportButton rows={waste.buckets} filename={`waste-${wasteRange}-${from}-to-${to}.csv`} />
                  </div>
                </CardHeader>
                <CardBody>
                  {waste.buckets.length === 0 ? (
                    <p className="text-muted mb-0">No waste recorded in this range.</p>
                  ) : (
                    <ReactApexChart
                      options={barChartOptions(waste.buckets.map((b) => b.date))}
                      series={[{ name: "Waste Cost (RM)", data: waste.buckets.map((b) => b.cost) }]}
                      type="bar"
                      height={260}
                    />
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="mb-3">
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="card-title mb-0">By Reason</h6>
                  <ExportButton rows={waste.byReason} filename={`waste-by-reason-${from}-to-${to}.csv`} />
                </CardHeader>
                <CardBody>
                  {waste.byReason.map((r) => (
                    <div key={r.reason} className="d-flex justify-content-between mb-1">
                      <span>{r.reason}</span><span className="fw-semibold">{r.count}</span>
                    </div>
                  ))}
                  {waste.byReason.length === 0 ? <p className="text-muted mb-0">No data.</p> : null}
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="card-title mb-0">By Item</h6>
                  <ExportButton rows={waste.byItem} filename={`waste-by-item-${from}-to-${to}.csv`} />
                </CardHeader>
                <CardBody>
                  {waste.byItem.map((i) => (
                    <div key={i.inventoryItemId} className="d-flex justify-content-between mb-1">
                      <span>{i.name}</span><span className="fw-semibold">RM {i.cost.toFixed(2)}</span>
                    </div>
                  ))}
                  {waste.byItem.length === 0 ? <p className="text-muted mb-0">No data.</p> : null}
                </CardBody>
              </Card>
            </Col>
          </Row>
        ) : null}

        {activeTab === "Staff" && staffSales ? (
          <Card>
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Sales by Waiter</h6>
              <ExportButton
                rows={staffSales.staff.map((s, idx) => ({ rank: idx + 1, ...s }))}
                filename={`staff-sales-${from}-to-${to}.csv`}
              />
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <Table className="align-middle table-nowrap mb-0">
                  <thead className="table-light"><tr><th>#</th><th>Staff</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {staffSales.staff.map((s, idx) => (
                      <tr key={s.employeeId}>
                        <td>{idx + 1}</td>
                        <td>{s.name}</td>
                        <td>{s.orderCount}</td>
                        <td>RM {s.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {staffSales.staff.length === 0 ? <p className="text-muted mt-2 mb-0">No completed orders attributed to staff in this range.</p> : null}
              </div>
            </CardBody>
          </Card>
        ) : null}

        {activeTab === "Kitchen" && kitchenPerf ? (
          <>
            <p className="text-muted fs-13">
              Restaurant-wide prep-time trend (order created &rarr; marked Ready). Not broken down per chef &mdash;
              the system doesn't yet track which employee performed each kitchen status change.
            </p>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Card><CardBody><h4 className="mb-0">{kitchenPerf.overallAvgPrepMinutes} min</h4><p className="text-muted mb-0">Average Prep Time</p></CardBody></Card>
              </Col>
              <Col md={4}>
                <Card><CardBody><h4 className="mb-0">{kitchenPerf.overallMedianPrepMinutes} min</h4><p className="text-muted mb-0">Median Prep Time</p></CardBody></Card>
              </Col>
              <Col md={4}>
                <div className="d-flex gap-1 h-100 align-items-start">
                  {["daily", "weekly", "monthly"].map((r) => (
                    <button key={r} type="button" className={`btn btn-sm ${kitchenRange === r ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setKitchenRange(r)}>
                      {r[0].toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </Col>
            </Row>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h6 className="card-title mb-0">Average Prep Minutes by {kitchenRange[0].toUpperCase() + kitchenRange.slice(1)}</h6>
                <ExportButton rows={kitchenPerf.buckets} filename={`kitchen-performance-${kitchenRange}-${from}-to-${to}.csv`} />
              </CardHeader>
              <CardBody>
                {kitchenPerf.buckets.length === 0 ? (
                  <p className="text-muted mb-0">No orders reached "Ready" in this range yet.</p>
                ) : (
                  <ReactApexChart
                    options={barChartOptions(kitchenPerf.buckets.map((b) => b.date))}
                    series={[{ name: "Avg Prep Minutes", data: kitchenPerf.buckets.map((b) => b.avgPrepMinutes) }]}
                    type="bar"
                    height={260}
                  />
                )}
              </CardBody>
            </Card>
          </>
        ) : null}
      </Container>
    </div>
  );
};

export default Reports;
