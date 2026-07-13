import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row, Button, Nav, NavItem, NavLink } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import { getOrders, updateOrderStatus } from "../../slices/thunks";
import { ORDER_TYPES, NEXT_STATUS, PREV_STATUS, ORDER_TYPES_REQUIRING_TABLE } from "../../common/orderConstants";
import { PREVIEW_ORDERS } from "../../common/previewOrders";
import { formatElapsed, elapsedMinutes } from "../../common/orderUtils";
import { useNewTicketAlert } from "../../common/useNewTicketAlert";
import "../../common/boardAlerts.scss";
import "./kitchen.scss";

const MUTED_KEY = "rms-kitchen-muted";

const loadMuted = () => {
  try {
    return localStorage.getItem(MUTED_KEY) === "true";
  } catch (e) {
    return false;
  }
};

const saveMuted = (muted) => {
  try {
    localStorage.setItem(MUTED_KEY, String(muted));
  } catch (e) {
    // ignore storage errors (e.g. private browsing quota)
  }
};

function badge(value, color) {
  return <span className={`badge bg-${color}-subtle text-${color}`}>{value}</span>;
}

// Kitchen only acts on new and in-progress tickets; once marked "Ready" a
// ticket stays visible for pickup confirmation but has no further kitchen
// action — front-of-house takes it from there (Served) on the Orders board.
const KITCHEN_COLUMNS = [
  { status: "Pending", label: "New" },
  { status: "Preparing", label: "Cooking" },
  { status: "Ready", label: "Ready for Pickup" },
];

// Kitchen-specific phrasing for the one action a ticket needs at each stage —
// deliberately different wording from the Orders board's generic labels.
const KITCHEN_ACTION_LABEL = {
  Pending: "Start Cooking",
  Preparing: "Mark Ready",
};

const FILTER_TYPES = ["All", ...ORDER_TYPES.map((t) => t.value)];

const URGENT_AFTER_MINUTES = 15;

function KitchenTicket({ order, dispatch }) {
  const type = ORDER_TYPES.find((t) => t.value === order.orderType);
  const mins = elapsedMinutes(order.createdAt);
  const urgent = order.status !== "Ready" && mins >= URGENT_AFTER_MINUTES;
  const actionLabel = KITCHEN_ACTION_LABEL[order.status];
  const nextInfo = NEXT_STATUS[order.status];
  const prevStatus = PREV_STATUS[order.status];

  const handleAdvance = () => {
    if (!nextInfo) return;
    dispatch(updateOrderStatus({ id: order.id, data: { status: nextInfo.next } }));
  };

  const handleRecall = () => {
    if (!prevStatus) return;
    dispatch(updateOrderStatus({ id: order.id, data: { status: prevStatus } }));
  };

  return (
    <div className={`border rounded p-3 bg-body ${urgent ? "border-danger border-2" : ""}`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="fs-16 fw-bold">#{order.id}</span>
        {badge(order.orderType, type?.color || "secondary")}
      </div>

      <div className="text-muted fs-13 mb-2">
        {ORDER_TYPES_REQUIRING_TABLE.includes(order.orderType) ? (order.table?.name ?? "—") : order.orderType}
      </div>

      <ul className="list-unstyled mb-2 fs-14">
        {(order.items || []).map((item, idx) => (
          <li key={idx} className="fw-medium">
            {item.quantity}&times; {item.menuItem?.name || "Item"}
          </li>
        ))}
      </ul>

      <div className={`d-flex justify-content-between align-items-center mb-2 fs-13 ${urgent ? "text-danger fw-semibold" : "text-muted"}`}>
        <span>{order.createdBy?.name}</span>
        <span>
          {urgent ? <i className="ri-alarm-warning-line align-bottom me-1"></i> : null}
          {formatElapsed(order.createdAt)}
        </span>
      </div>

      <div className="d-flex gap-2">
        {actionLabel ? (
          <Button size="lg" color="primary" className="w-100" onClick={handleAdvance}>
            <i className="ri-play-circle-line align-bottom me-1"></i> {actionLabel}
          </Button>
        ) : (
          <div className="text-center flex-grow-1">{badge("Ready for Pickup", "primary")}</div>
        )}
        {prevStatus ? (
          <Button size="lg" color="light" outline onClick={handleRecall} title={`Undo (back to ${prevStatus})`}>
            <i className="ri-arrow-go-back-line"></i>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function KitchenColumn({ status, label, orders, dispatch, flash }) {
  return (
    <Card className="h-100 mb-0">
      <CardHeader className={`d-flex align-items-center justify-content-between py-2 ${flash ? "board-flash" : ""}`}>
        <span className="fw-semibold">{label}</span>
        {badge(orders.length, "secondary")}
      </CardHeader>
      <CardBody style={{ maxHeight: "70vh", overflowY: "auto" }} className="d-flex flex-column gap-2">
        {orders.map((order) => (
          <KitchenTicket key={order.id} order={order} dispatch={dispatch} />
        ))}
        {orders.length === 0 ? <div className="text-muted text-center py-4 fs-13">No tickets</div> : null}
      </CardBody>
    </Card>
  );
}

const Kitchen = () => {
  document.title = "Kitchen | RMS";
  const dispatch = useDispatch();

  // Forces a re-render every 15s so elapsed time / urgency stay fresh, and
  // re-fetches orders on the same timer so the board auto-updates.
  const [, setTick] = useState(0);
  const [muted, setMuted] = useState(loadMuted);
  const [filterType, setFilterType] = useState("All");
  const [focusMode, setFocusMode] = useState(false);

  const kitchenPageData = createSelector(
    (state) => state.Orders,
    (state) => ({ orders: state.orders })
  );
  const { orders } = useSelector(kitchenPageData);

  useEffect(() => {
    dispatch(getOrders());
    const id = setInterval(() => {
      dispatch(getOrders());
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(id);
  }, [dispatch]);

  const sourceOrders = orders && orders.length > 0 ? orders : PREVIEW_ORDERS;

  const flashNew = useNewTicketAlert(sourceOrders, "Pending", muted);

  const toggleMuted = () => {
    setMuted((prev) => {
      const next = !prev;
      saveMuted(next);
      return next;
    });
  };

  const toggleFocusMode = () => {
    setFocusMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("kitchen-focus-mode");
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        document.body.classList.remove("kitchen-focus-mode");
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  };

  // Keep focus-mode state in sync if the user exits fullscreen via Esc, and
  // always clean up on unmount so navigating away never leaves the chrome hidden.
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        document.body.classList.remove("kitchen-focus-mode");
        setFocusMode(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.classList.remove("kitchen-focus-mode");
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (filterType === "All") return sourceOrders;
    return sourceOrders.filter((o) => o.orderType === filterType);
  }, [sourceOrders, filterType]);

  const grouped = useMemo(() => {
    const map = { Pending: [], Preparing: [], Ready: [] };
    filteredOrders.forEach((order) => {
      if (map[order.status]) map[order.status].push(order);
    });
    // Oldest first within each column — the ticket that's waited longest sits on top.
    Object.values(map).forEach((list) => list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    return map;
  }, [filteredOrders]);

  return (
    <div className="page-content kitchen-page">
      <Container fluid>
        <BreadCrumb title="Kitchen" pageTitle="Operations" />

        <Row className="align-items-center mb-3 g-2">
          <Col>
            <Nav pills>
              {FILTER_TYPES.map((type) => (
                <NavItem key={type}>
                  <NavLink
                    href="#"
                    active={filterType === type}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilterType(type);
                    }}
                  >
                    {type}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <Button color="secondary" outline onClick={toggleMuted} title={muted ? "Unmute alerts" : "Mute alerts"}>
              <i className={muted ? "ri-volume-mute-line" : "ri-volume-up-line"}></i>
            </Button>
            <Button color="secondary" outline onClick={toggleFocusMode} title={focusMode ? "Exit focus mode" : "Enter focus mode"}>
              <i className={focusMode ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
            </Button>
          </Col>
        </Row>

        <Row className="g-3">
          {KITCHEN_COLUMNS.map(({ status, label }) => (
            <Col key={status} xl={4} md={6} xs={12}>
              <KitchenColumn
                status={status}
                label={label}
                orders={grouped[status]}
                dispatch={dispatch}
                flash={status === "Pending" && flashNew}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Kitchen;
