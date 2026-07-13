import React, { useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Nav, NavItem, NavLink, Collapse, Input, Label, Table,
} from "reactstrap";
import classnames from "classnames";
import ReactApexChart from "react-apexcharts";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import { STATUS_BADGE } from "../../common/orderConstants";

const TABS = ["Overview", "Orders", "Sales", "Staff", "Inventory"];

const FILTER_GROUPS = [
  { title: "Date Range", options: ["Today", "Last 7 Days", "Last 30 Days", "Custom"] },
  { title: "Order Status", options: ["Pending", "Preparing", "Ready", "Served", "Completed", "Cancelled"] },
  { title: "Payment Method", options: ["Cash", "Debit Card", "Credit Card", "DuitNow QR"] },
  { title: "Table", options: ["Table 1", "Table 2", "Table 3", "Table 4"] },
  { title: "Staff Member", options: ["Default Admin", "Jane Waiter"] },
  { title: "Category", options: ["Appetizers", "Main Course", "Desserts", "Drinks"] },
];

const ORDER_TYPES = [
  { label: "Dine-In", count: 62, pct: "48.4%", color: "primary" },
  { label: "Takeaway", count: 40, pct: "31.3%", color: "info" },
  { label: "QR Order", count: 26, pct: "20.3%", color: "secondary" },
];

const RECENT_ORDERS = [
  { time: "19:42", order: "#1042", table: "Table 3", status: "Completed", payment: "DuitNow QR", total: "RM 58.00", staff: "Jane Waiter" },
  { time: "19:35", order: "#1041", table: "Table 1", status: "Preparing", payment: "Cash", total: "RM 32.50", staff: "Default Admin" },
  { time: "19:20", order: "#1040", table: "Takeaway", status: "Pending", payment: "Credit Card", total: "RM 21.00", staff: "Jane Waiter" },
  { time: "19:05", order: "#1039", table: "Table 2", status: "Completed", payment: "Debit Card", total: "RM 74.90", staff: "Default Admin" },
  { time: "18:58", order: "#1038", table: "Table 4", status: "Cancelled", payment: "Cash", total: "RM 15.00", staff: "Jane Waiter" },
];

const chartSeries = [{ name: "Orders", data: [14, 18, 12, 22, 30, 38, 27] }];
const chartOptions = {
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
  dataLabels: { enabled: false },
  xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  colors: ["#405189"],
};

const Dashboard = () => {
  document.title = "Dashboard | RMS";
  const [activeTab, setActiveTab] = useState("Overview");
  const [openFilters, setOpenFilters] = useState(() => new Set(["Date Range"]));

  const toggleFilter = (title) => {
    setOpenFilters((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Dashboard" pageTitle="RMS" />

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

        <Row>
          <Col lg={3}>
            <Card>
              <CardHeader>
                <h6 className="card-title mb-0">Filters</h6>
              </CardHeader>
              <CardBody>
                {FILTER_GROUPS.map((group) => (
                  <div key={group.title} className="mb-2">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none d-flex justify-content-between w-100 text-body fw-medium"
                      onClick={() => toggleFilter(group.title)}
                    >
                      {group.title}
                      <i className={`ri-arrow-${openFilters.has(group.title) ? "up" : "down"}-s-line`}></i>
                    </button>
                    <Collapse isOpen={openFilters.has(group.title)}>
                      <div className="pt-2 ps-1">
                        {group.options.map((option) => (
                          <div className="form-check mb-1" key={option}>
                            <Input type="checkbox" id={`${group.title}-${option}`} />
                            <Label className="form-check-label" htmlFor={`${group.title}-${option}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    </Collapse>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>

          <Col lg={9}>
            <Row>
              <Col md={5}>
                <Card>
                  <CardBody>
                    <h2 className="mb-0">128</h2>
                    <p className="text-muted mb-3">ORDERS TODAY</p>
                    {ORDER_TYPES.map((type) => (
                      <div className="d-flex align-items-center justify-content-between mb-2" key={type.label}>
                        <span>
                          <i className={`mdi mdi-circle text-${type.color} me-1`}></i>
                          {type.label}
                        </span>
                        <span className="fw-semibold">{type.count} <span className="text-muted fw-normal">{type.pct}</span></span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </Col>
              <Col md={7}>
                <Card>
                  <CardHeader>
                    <h6 className="card-title mb-0">Orders This Week</h6>
                  </CardHeader>
                  <CardBody>
                    <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={220} />
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h6 className="card-title mb-0">Recent Orders</h6>
                <button type="button" className="btn btn-sm btn-outline-secondary">Full List</button>
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
                      {RECENT_ORDERS.map((order) => (
                        <tr key={order.order}>
                          <td>{order.time}</td>
                          <td>{order.order}</td>
                          <td>{order.table}</td>
                          <td>
                            <span className={`badge bg-${STATUS_BADGE[order.status]}-subtle text-${STATUS_BADGE[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{order.payment}</td>
                          <td>{order.total}</td>
                          <td>{order.staff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
