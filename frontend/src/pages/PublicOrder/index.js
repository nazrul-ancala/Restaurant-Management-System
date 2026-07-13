import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { getMenuItems, getTables, createOrder } from "../../slices/thunks";
import { PREVIEW_MENU_ITEMS } from "../../common/previewMenuItems";

const PublicOrder = () => {
  document.title = "Order | RMS";
  const { tableId } = useParams();
  const dispatch = useDispatch();
  const [cart, setCart] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const orderPageData = createSelector(
    (state) => state.Orders,
    (state) => ({ menuItems: state.menuItems, tables: state.tables })
  );
  const { menuItems, tables } = useSelector(orderPageData);

  useEffect(() => {
    dispatch(getMenuItems());
    dispatch(getTables());
  }, [dispatch]);

  const sourceItems = menuItems && menuItems.length > 0 ? menuItems : PREVIEW_MENU_ITEMS;
  const displayItems = sourceItems.filter((item) => item.status !== "unavailable");
  const table = (tables || []).find((t) => String(t.id) === String(tableId));

  const itemsByCategory = useMemo(() => {
    const map = {};
    displayItems.forEach((item) => {
      const category = item.category?.name || "Other";
      if (!map[category]) map[category] = [];
      map[category].push(item);
    });
    return map;
  }, [displayItems]);

  const setQuantity = (itemId, quantity) => {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = quantity;
      }
      return next;
    });
  };

  const cartCount = Object.values(cart).reduce((n, q) => n + q, 0);
  const total = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = displayItems.find((m) => String(m.id) === String(itemId));
    return sum + (item ? Number(item.price) * qty : 0);
  }, 0);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const payload = {
      orderType: "QR Order",
      tableId: Number(tableId),
      items: Object.entries(cart).map(([menuItemId, quantity]) => ({
        menuItemId: Number(menuItemId),
        quantity,
      })),
    };
    const result = await dispatch(createOrder(payload));
    setSubmitting(false);
    if (!result.error) {
      setPlaced(true);
    }
  };

  if (placed) {
    return (
      <div className="page-content">
        <Container className="py-5 text-center">
          <i className="ri-checkbox-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
          <h4 className="mt-3">Order placed!</h4>
          <p className="text-muted">Please pay at the counter when your order is ready.</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container className="pb-5" style={{ maxWidth: "560px" }}>
        <div className="text-center mb-4">
          <h4 className="mb-1">{table?.name || `Table ${tableId}`}</h4>
          <p className="text-muted">Browse the menu and place your order</p>
        </div>

        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h6 className="text-uppercase text-muted fs-13 mb-2">{category}</h6>
            {items.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <Card key={item.id} className="mb-2">
                  <CardBody className="d-flex align-items-center justify-content-between py-2">
                    <div>
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-muted fs-13">RM {Number(item.price).toFixed(2)}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button size="sm" color="secondary" outline onClick={() => setQuantity(item.id, qty - 1)} disabled={qty === 0}>
                        <i className="ri-subtract-line"></i>
                      </Button>
                      <span style={{ minWidth: "1.5rem" }} className="text-center">{qty}</span>
                      <Button size="sm" color="secondary" outline onClick={() => setQuantity(item.id, qty + 1)}>
                        <i className="ri-add-line"></i>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ))}
      </Container>

      {cartCount > 0 ? (
        <div className="position-fixed bottom-0 start-0 end-0 bg-body border-top p-3">
          <Container style={{ maxWidth: "560px" }} className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">{cartCount} item(s)</div>
              <div className="text-muted fs-13">RM {total.toFixed(2)}</div>
            </div>
            <Button color="primary" disabled={submitting} onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </Container>
        </div>
      ) : null}
    </div>
  );
};

export default PublicOrder;
