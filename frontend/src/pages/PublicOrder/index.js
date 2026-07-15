import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { getPublicTable, getPublicMenu, createPublicOrder } from "../../helpers/backend_helper";
import { PREVIEW_MENU_ITEMS } from "../../common/previewMenuItems";
import "./publicOrder.scss";

const ALL_CATEGORY = "All";

const PublicOrder = () => {
  document.title = "Order | RMS";
  const { qrCode } = useParams();
  const [cart, setCart] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [table, setTable] = useState(null);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [brokenImageIds, setBrokenImageIds] = useState(() => new Set());
  const [orderError, setOrderError] = useState(null);

  // Local state + direct API calls (not Redux) — this is an anonymous customer
  // session, deliberately kept separate from the staff Orders slice.
  useEffect(() => {
    getPublicMenu()
      .then((res) => setMenuItems(res.items || []))
      .catch(() => setMenuItems([]));
    getPublicTable(qrCode)
      .then((res) => setTable(res.table))
      .catch(() => setTable(null));
  }, [qrCode]);

  const sourceItems = menuItems && menuItems.length > 0 ? menuItems : PREVIEW_MENU_ITEMS;
  const displayItems = sourceItems.filter((item) => item.status !== "unavailable");

  const itemsByCategory = useMemo(() => {
    const map = {};
    displayItems.forEach((item) => {
      const category = item.category?.name || "Other";
      if (!map[category]) map[category] = [];
      map[category].push(item);
    });
    return map;
  }, [displayItems]);

  const categories = useMemo(() => [ALL_CATEGORY, ...Object.keys(itemsByCategory)], [itemsByCategory]);

  const visibleItems = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return displayItems;
    return itemsByCategory[activeCategory] || [];
  }, [activeCategory, displayItems, itemsByCategory]);

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

  const markImageBroken = (itemId) => {
    setBrokenImageIds((prev) => new Set(prev).add(itemId));
  };

  const cartCount = Object.values(cart).reduce((n, q) => n + q, 0);
  const total = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = displayItems.find((m) => String(m.id) === String(itemId));
    return sum + (item ? Number(item.price) * qty : 0);
  }, 0);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setOrderError(null);
    const payload = {
      qrCode,
      items: Object.entries(cart).map(([menuItemId, quantity]) => ({
        menuItemId: Number(menuItemId),
        quantity,
      })),
    };
    try {
      await createPublicOrder(payload);
      setPlaced(true);
    } catch (e) {
      // createPublicOrder rejects with a plain string message (see api_helper's interceptor)
      setOrderError(typeof e === "string" ? e : "Could not place your order. Please try again.");
    }
    setSubmitting(false);
  };

  if (placed) {
    return (
      <div className="public-order">
        <div className="public-order-placed">
          <div className="public-order-placed-icon">
            <i className="ri-check-line"></i>
          </div>
          <h4 className="public-order-placed-title">Order placed!</h4>
          <p className="public-order-placed-body">Please pay at the counter when your order is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-order">
      <div className="public-order-header">
        <p className="public-order-eyebrow">Scan &amp; Order</p>
        <h4 className="public-order-title">{table?.name || "Order"}</h4>
        <p className="public-order-subtitle">Browse the menu and place your order</p>
      </div>

      <div className="public-order-tabs">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`public-order-tab ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="public-order-grid">
        {visibleItems.map((item) => {
          const qty = cart[item.id] || 0;
          const hasImage = item.imageUrl && !brokenImageIds.has(item.id);
          return (
            <div key={item.id} className="public-order-card">
              <div className="public-order-card-image-wrap">
                {hasImage ? (
                  <img src={item.imageUrl} alt={item.name} onError={() => markImageBroken(item.id)} />
                ) : (
                  <div className="public-order-card-placeholder">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 3v7a2 2 0 0 0 2 2v9M7 3a2 2 0 0 0-2 2v5M7 3a2 2 0 0 1 2 2v5M17 3v18M17 3a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="public-order-card-body">
                <div className="public-order-card-top">
                  <h3 className="public-order-card-name">{item.name}</h3>
                  <span className="public-order-card-price">RM {Number(item.price).toFixed(2)}</span>
                </div>
                {item.description ? <p className="public-order-card-desc">{item.description}</p> : null}
                <div className="public-order-stepper">
                  <button
                    type="button"
                    className="public-order-stepper-btn"
                    onClick={() => setQuantity(item.id, qty - 1)}
                    disabled={qty === 0}
                  >
                    &minus;
                  </button>
                  <span className="public-order-stepper-qty">{qty}</span>
                  <button type="button" className="public-order-stepper-btn" onClick={() => setQuantity(item.id, qty + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cartCount > 0 ? (
        <div className="public-order-cart-bar">
          {orderError ? <div className="public-order-error">{orderError}</div> : null}
          <div className="public-order-cart-bar-row">
            <div>
              <div className="public-order-cart-count">{cartCount} item(s)</div>
              <div className="public-order-cart-total">RM {total.toFixed(2)}</div>
            </div>
            <button type="button" className="public-order-cta" disabled={submitting} onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PublicOrder;
