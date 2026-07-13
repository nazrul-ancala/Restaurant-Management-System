import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import { getOrders, getTables, getMenuItems, createOrder, updateOrderStatus } from "../../slices/thunks";
import { ORDER_TYPES, STATUS_BADGE, NEXT_STATUS, TERMINAL_STATUSES, PAYMENT_METHODS, ORDER_TYPES_REQUIRING_TABLE, MANUAL_ORDER_TYPES } from "../../common/orderConstants";

function badge(value, color) {
  return <span className={`badge bg-${color}-subtle text-${color}`}>{value}</span>;
}

// Preview rows shown only until the backend returns real orders (same sample
// data already used on the Dashboard mock) — automatically replaced once
// getOrders() actually returns something.
const PREVIEW_ORDERS = [
  { id: 1042, orderType: "QR Order", table: { name: "Table 3" }, items: [{ quantity: 2 }], status: "Completed", total: 58.0, createdBy: { name: "Jane Waiter" }, createdAt: "2026-07-09T19:42:00" },
  { id: 1041, orderType: "Dine-In", table: { name: "Table 1" }, items: [{ quantity: 1 }], status: "Preparing", total: 32.5, createdBy: { name: "Default Admin" }, createdAt: "2026-07-09T19:35:00" },
  { id: 1040, orderType: "Takeaway", table: null, items: [{ quantity: 3 }], status: "Pending", total: 21.0, createdBy: { name: "Jane Waiter" }, createdAt: "2026-07-09T19:20:00" },
  { id: 1039, orderType: "Dine-In", table: { name: "Table 2" }, items: [{ quantity: 2 }, { quantity: 2 }], status: "Completed", total: 74.9, createdBy: { name: "Default Admin" }, createdAt: "2026-07-09T19:05:00" },
  { id: 1038, orderType: "Dine-In", table: { name: "Table 4" }, items: [{ quantity: 1 }], status: "Cancelled", total: 15.0, createdBy: { name: "Jane Waiter" }, createdAt: "2026-07-09T18:58:00" },
];

const LIVE_STATUSES = ["Pending", "Preparing", "Ready", "Served"];

function formatElapsed(createdAt) {
  if (!createdAt) return "";
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function OrderCard({ order, dispatch, onRequestComplete, condensed }) {
  const type = ORDER_TYPES.find((t) => t.value === order.orderType);
  const itemCount = (order.items || []).reduce((n, i) => n + i.quantity, 0);
  const nextInfo = NEXT_STATUS[order.status];
  const isTerminal = TERMINAL_STATUSES.includes(order.status);

  const handleAdvance = () => {
    if (!nextInfo) return;
    if (nextInfo.next === "Completed") {
      onRequestComplete(order.id);
    } else {
      dispatch(updateOrderStatus({ id: order.id, data: { status: nextInfo.next } }));
    }
  };

  const handleCancel = () => {
    dispatch(updateOrderStatus({ id: order.id, data: { status: "Cancelled" } }));
  };

  return (
    <div className={`border rounded position-relative bg-body ${condensed ? "p-2" : "p-3"}`}>
      {!isTerminal ? (
        <button
          type="button"
          className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 p-1"
          title="Cancel order"
          onClick={handleCancel}
        >
          <i className="ri-close-circle-line"></i>
        </button>
      ) : null}

      <div className="d-flex align-items-center gap-2 mb-1">
        <span className="fw-semibold">#{order.id}</span>
        {badge(order.orderType, type?.color || "secondary")}
      </div>

      <div className="text-muted fs-13 mb-1">
        {ORDER_TYPES_REQUIRING_TABLE.includes(order.orderType) ? (order.table?.name ?? "—") : order.orderType}
      </div>

      <div className="d-flex justify-content-between fs-13 mb-1">
        <span>{itemCount} item(s)</span>
        <span className="fw-semibold">RM {Number(order.total).toFixed(2)}</span>
      </div>

      <div className="d-flex justify-content-between text-muted fs-12 mb-2">
        <span>{order.createdBy?.name}</span>
        <span>{formatElapsed(order.createdAt)}</span>
      </div>

      {!condensed && nextInfo ? (
        <Button size="sm" color="primary" className="w-100" onClick={handleAdvance}>
          <i className="ri-play-circle-line align-bottom me-1"></i> {nextInfo.label}
        </Button>
      ) : null}

      {condensed ? badge(order.status, STATUS_BADGE[order.status] || "secondary") : null}
    </div>
  );
}

function StatusColumn({ status, orders, dispatch, onRequestComplete }) {
  return (
    <Card className="h-100 mb-0">
      <CardHeader className="d-flex align-items-center justify-content-between py-2">
        <span className="fw-semibold">{status}</span>
        {badge(orders.length, STATUS_BADGE[status] || "secondary")}
      </CardHeader>
      <CardBody
        style={{ maxHeight: "60vh", overflowY: "auto" }}
        className="d-flex flex-column gap-2"
      >
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} dispatch={dispatch} onRequestComplete={onRequestComplete} />
        ))}
        {orders.length === 0 ? <div className="text-muted text-center py-4 fs-13">No orders</div> : null}
      </CardBody>
    </Card>
  );
}

const Orders = () => {
  document.title = "Orders | RMS";
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [completeOrderId, setCompleteOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  // Forces a re-render every 30s so each card's "Xm ago" text stays fresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const ordersPageData = createSelector(
    (state) => state.Orders,
    (state) => ({
      orders: state.orders,
      tables: state.tables,
      menuItems: state.menuItems,
    })
  );
  const { orders, tables, menuItems } = useSelector(ordersPageData);

  useEffect(() => {
    dispatch(getOrders());
    dispatch(getTables());
    dispatch(getMenuItems());
  }, [dispatch]);

  const toggleModal = () => setModal(!modal);

  const itemsByCategory = useMemo(() => {
    const map = {};
    (menuItems || []).forEach((item) => {
      const category = item.category?.name || "Other";
      if (!map[category]) map[category] = [];
      map[category].push(item);
    });
    return map;
  }, [menuItems]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      orderType: "",
      tableId: "",
      items: [{ menuItemId: "", quantity: 1 }],
    },
    validationSchema: Yup.object({
      orderType: Yup.string()
        .oneOf(MANUAL_ORDER_TYPES.map((t) => t.value))
        .required("Order type is required"),
      tableId: Yup.string().when("orderType", {
        is: (value) => ORDER_TYPES_REQUIRING_TABLE.includes(value),
        then: (schema) => schema.required("Select a table"),
        otherwise: (schema) => schema.notRequired(),
      }),
      items: Yup.array()
        .of(
          Yup.object({
            menuItemId: Yup.string().required("Select an item"),
            quantity: Yup.number().typeError("Enter a quantity").min(1, "Min 1").required("Required"),
          })
        )
        .min(1, "Add at least one item"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        orderType: values.orderType,
        items: values.items.map((row) => ({
          menuItemId: Number(row.menuItemId),
          quantity: Number(row.quantity),
        })),
      };
      if (ORDER_TYPES_REQUIRING_TABLE.includes(values.orderType)) payload.tableId = Number(values.tableId);

      const result = await dispatch(createOrder(payload));
      if (!result.error) {
        resetForm();
        setModal(false);
      }
    },
  });

  const addItemRow = () => {
    validation.setFieldValue("items", [...validation.values.items, { menuItemId: "", quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    validation.setFieldValue(
      "items",
      validation.values.items.filter((_, i) => i !== index)
    );
  };

  const updateItemRow = (index, field, value) => {
    const items = validation.values.items.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    validation.setFieldValue("items", items);
  };

  const total = useMemo(() => {
    return (validation.values.items || []).reduce((sum, row) => {
      const item = (menuItems || []).find((m) => String(m.id) === String(row.menuItemId));
      const price = item ? Number(item.price) : 0;
      const quantity = Number(row.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }, [validation.values.items, menuItems]);

  const openCompleteModal = (orderId) => {
    setPaymentMethod("");
    setCompleteOrderId(orderId);
  };
  const closeCompleteModal = () => setCompleteOrderId(null);
  const confirmComplete = () => {
    if (!paymentMethod) return;
    dispatch(updateOrderStatus({ id: completeOrderId, data: { status: "Completed", paymentMethod } }));
    closeCompleteModal();
  };

  const sourceOrders = orders && orders.length > 0 ? orders : PREVIEW_ORDERS;

  const searchedOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sourceOrders;
    return sourceOrders.filter((order) =>
      [order.id, order.table?.name, order.createdBy?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [sourceOrders, searchTerm]);

  const grouped = useMemo(() => {
    const map = { Pending: [], Preparing: [], Ready: [], Served: [] };
    searchedOrders.forEach((order) => {
      if (map[order.status]) map[order.status].push(order);
    });
    return map;
  }, [searchedOrders]);

  const historyOrders = useMemo(() => {
    return searchedOrders
      .filter((order) => TERMINAL_STATUSES.includes(order.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [searchedOrders]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Orders" pageTitle="Operations" />

        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="card-title mb-0">Orders Board</h5>
            <div className="d-flex align-items-center gap-2">
              <Input
                type="search"
                placeholder="Search order #, table, staff…"
                style={{ maxWidth: "240px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button color="primary" onClick={toggleModal}>
                <i className="ri-add-line align-bottom me-1"></i> New Order
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Row className="g-3 mt-0">
          {LIVE_STATUSES.map((status) => (
            <Col key={status} xl={3} md={6} xs={12}>
              <StatusColumn
                status={status}
                orders={grouped[status]}
                dispatch={dispatch}
                onRequestComplete={openCompleteModal}
              />
            </Col>
          ))}
        </Row>

        <Card className="mt-3">
          <CardHeader
            role="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className="d-flex align-items-center justify-content-between"
          >
            <h6 className="mb-0">History (Completed / Cancelled) — {historyOrders.length}</h6>
            <i className={`ri-arrow-${historyOpen ? "up" : "down"}-s-line fs-18`}></i>
          </CardHeader>
          {historyOpen ? (
            <CardBody className="d-flex flex-column gap-2">
              {historyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  dispatch={dispatch}
                  onRequestComplete={openCompleteModal}
                  condensed
                />
              ))}
              {historyOrders.length === 0 ? (
                <div className="text-muted text-center py-3">No completed or cancelled orders yet</div>
              ) : null}
            </CardBody>
          ) : null}
        </Card>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} centered size="lg">
        <ModalHeader toggle={toggleModal}>New Order</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <Row>
              <Col md={6} className="mb-3">
                <Label htmlFor="orderType">Order Type</Label>
                <Input
                  type="select"
                  name="orderType"
                  id="orderType"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.orderType}
                  invalid={validation.touched.orderType && !!validation.errors.orderType}
                >
                  <option value="">Select order type</option>
                  {MANUAL_ORDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.value}</option>
                  ))}
                </Input>
                {validation.touched.orderType && validation.errors.orderType ? (
                  <FormFeedback type="invalid">{validation.errors.orderType}</FormFeedback>
                ) : null}
              </Col>

              {ORDER_TYPES_REQUIRING_TABLE.includes(validation.values.orderType) ? (
                <Col md={6} className="mb-3">
                  <Label htmlFor="tableId">Table</Label>
                  <Input
                    type="select"
                    name="tableId"
                    id="tableId"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.tableId}
                    invalid={validation.touched.tableId && !!validation.errors.tableId}
                  >
                    <option value="">Select a table</option>
                    {(tables || []).map((table) => (
                      <option key={table.id} value={table.id}>{table.name}</option>
                    ))}
                  </Input>
                  {validation.touched.tableId && validation.errors.tableId ? (
                    <FormFeedback type="invalid">{validation.errors.tableId}</FormFeedback>
                  ) : null}
                </Col>
              ) : null}
            </Row>

            <Label>Items</Label>
            {validation.values.items.map((row, index) => {
              const rowError = validation.errors.items?.[index];
              const rowTouched = validation.touched.items?.[index];
              return (
                <Row key={index} className="mb-2 align-items-start">
                  <Col md={7}>
                    <Input
                      type="select"
                      value={row.menuItemId}
                      onChange={(e) => updateItemRow(index, "menuItemId", e.target.value)}
                      invalid={!!(rowTouched?.menuItemId && rowError?.menuItemId)}
                    >
                      <option value="">Select an item</option>
                      {Object.entries(itemsByCategory).map(([category, items]) => (
                        <optgroup key={category} label={category}>
                          {items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} — RM {Number(item.price).toFixed(2)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Input>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateItemRow(index, "quantity", e.target.value)}
                      invalid={!!(rowTouched?.quantity && rowError?.quantity)}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      color="danger"
                      outline
                      className="w-100"
                      type="button"
                      disabled={validation.values.items.length === 1}
                      onClick={() => removeItemRow(index)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              );
            })}
            {typeof validation.errors.items === "string" ? (
              <div className="text-danger fs-13 mb-2">{validation.errors.items}</div>
            ) : null}

            <Button color="secondary" outline size="sm" type="button" className="mb-3" onClick={addItemRow}>
              <i className="ri-add-line align-bottom me-1"></i> Add Item
            </Button>

            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <h5 className="mb-0">Total: RM {total.toFixed(2)}</h5>
              <Button type="submit" color="success" disabled={validation.isSubmitting}>
                Create Order
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={completeOrderId !== null} toggle={closeCompleteModal} centered>
        <ModalHeader toggle={closeCompleteModal}>Complete Order</ModalHeader>
        <ModalBody>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Input
            type="select"
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Select payment method</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>{pm}</option>
            ))}
          </Input>
          <div className="text-end mt-3">
            <Button color="success" disabled={!paymentMethod} onClick={confirmComplete}>
              Confirm
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Orders;
