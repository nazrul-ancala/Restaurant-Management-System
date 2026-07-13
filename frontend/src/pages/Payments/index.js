import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback,
  Nav, NavItem, NavLink,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import { getOrders, updateOrderStatus } from "../../slices/thunks";
import { PREVIEW_ORDERS } from "../../common/previewOrders";
import { STATUS_BADGE } from "../../common/orderConstants";

const DATE_RANGES = ["Today", "This Week", "This Month", "All Time"];

function isInRange(dateStr, range) {
  if (range === "All Time") return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (range === "Today") {
    return date.toDateString() === now.toDateString();
  }
  if (range === "This Week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (range === "This Month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  return true;
}

const Payments = () => {
  document.title = "Payments | RMS";
  const dispatch = useDispatch();

  // "This Month" (not "Today") is the default so the ledger shows real
  // content immediately with the preview data — see previewOrders.js.
  const [dateRange, setDateRange] = useState("This Month");
  const [refundTarget, setRefundTarget] = useState(null);

  const paymentsPageData = createSelector(
    (state) => state.Orders,
    (state) => ({ orders: state.orders })
  );
  const { orders } = useSelector(paymentsPageData);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const sourceOrders = orders && orders.length > 0 ? orders : PREVIEW_ORDERS;

  const transactions = useMemo(() => {
    return sourceOrders
      .filter((o) => o.status === "Completed" || o.status === "Refunded")
      .filter((o) => isInRange(o.createdAt, dateRange))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sourceOrders, dateRange]);

  const summary = useMemo(() => {
    const byMethod = {};
    let total = 0;
    let refundedCount = 0;
    transactions.forEach((t) => {
      if (t.status === "Completed") {
        total += Number(t.total);
        const method = t.paymentMethod || "Unknown";
        byMethod[method] = (byMethod[method] || 0) + Number(t.total);
      } else if (t.status === "Refunded") {
        refundedCount += 1;
      }
    });
    return { total, byMethod, refundedCount };
  }, [transactions]);

  const refundValidation = useFormik({
    enableReinitialize: true,
    initialValues: { reason: "" },
    validationSchema: Yup.object({
      reason: Yup.string().required("A reason is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(
        updateOrderStatus({ id: refundTarget.id, data: { status: "Refunded", refundReason: values.reason } })
      );
      if (!result.error) {
        resetForm();
        setRefundTarget(null);
      }
    },
  });

  const openRefundModal = (order) => {
    refundValidation.resetForm();
    setRefundTarget(order);
  };
  const closeRefundModal = () => setRefundTarget(null);

  const columns = useMemo(
    () => [
      { header: "Order #", accessorKey: "id", enableColumnFilter: false, cell: (cell) => `#${cell.getValue()}` },
      {
        header: "Date/Time",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: (cell) => new Date(cell.getValue()).toLocaleString(),
      },
      { header: "Type", accessorKey: "orderType", enableColumnFilter: false },
      {
        header: "Table",
        id: "table",
        enableColumnFilter: false,
        cell: (cell) => cell.row.original.table?.name || "—",
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "—",
      },
      {
        header: "Amount",
        accessorKey: "total",
        enableColumnFilter: false,
        cell: (cell) => `RM ${Number(cell.getValue()).toFixed(2)}`,
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => (
          <span className={`badge bg-${STATUS_BADGE[cell.getValue()] || "secondary"}-subtle text-${STATUS_BADGE[cell.getValue()] || "secondary"}`}>
            {cell.getValue()}
          </span>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        enableColumnFilter: false,
        cell: (cell) => {
          const order = cell.row.original;
          if (order.status !== "Completed") return null;
          return (
            <Button size="sm" color="danger" outline onClick={() => openRefundModal(order)} title="Refund">
              <i className="ri-refund-2-line"></i>
            </Button>
          );
        },
      },
    ],
    [dispatch]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Payments" pageTitle="Operations" />

        <Row className="mb-3">
          <Col>
            <Nav pills>
              {DATE_RANGES.map((range) => (
                <NavItem key={range}>
                  <NavLink
                    href="#"
                    active={dateRange === range}
                    onClick={(e) => {
                      e.preventDefault();
                      setDateRange(range);
                    }}
                  >
                    {range}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>
        </Row>

        <Row className="g-3 mb-3">
          <Col md={4}>
            <Card className="mb-0 h-100">
              <CardBody>
                <p className="text-muted mb-1">Total Revenue</p>
                <h4 className="mb-0">RM {summary.total.toFixed(2)}</h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-0 h-100">
              <CardBody>
                <p className="text-muted mb-1">By Payment Method</p>
                {Object.keys(summary.byMethod).length === 0 ? (
                  <div className="text-muted fs-13">No completed transactions</div>
                ) : (
                  Object.entries(summary.byMethod).map(([method, amount]) => (
                    <div key={method} className="d-flex justify-content-between fs-13">
                      <span>{method}</span>
                      <span className="fw-semibold">RM {amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-0 h-100">
              <CardBody>
                <p className="text-muted mb-1">Refunded</p>
                <h4 className="mb-0">{summary.refundedCount}</h4>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Transactions</h5>
              </CardHeader>
              <CardBody>
                <TableContainer
                  columns={columns}
                  data={transactions}
                  isGlobalFilter={true}
                  customPageSize={10}
                  divClass="table-responsive table-card"
                  tableClass="align-middle table-nowrap"
                  theadClass="table-light"
                  SearchPlaceholder="Search transactions..."
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={!!refundTarget} toggle={closeRefundModal} centered>
        <ModalHeader toggle={closeRefundModal}>
          Refund Order{refundTarget ? ` #${refundTarget.id}` : ""}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              refundValidation.handleSubmit();
              return false;
            }}
          >
            <div className="mb-3">
              <Label htmlFor="reason">Reason</Label>
              <Input
                type="textarea"
                rows={3}
                name="reason"
                id="reason"
                onChange={refundValidation.handleChange}
                onBlur={refundValidation.handleBlur}
                value={refundValidation.values.reason}
                invalid={refundValidation.touched.reason && !!refundValidation.errors.reason}
              />
              {refundValidation.touched.reason && refundValidation.errors.reason ? (
                <FormFeedback type="invalid">{refundValidation.errors.reason}</FormFeedback>
              ) : null}
            </div>
            <div className="text-end">
              <Button type="submit" color="danger" disabled={refundValidation.isSubmitting}>
                Confirm Refund
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Payments;
