import React, { useEffect, useState } from "react";
import { getPublicMenu, getPublicSettings } from "../../helpers/backend_helper";
import "./landing.scss";

// Matches the page's original hardcoded copy -- used until the real
// settings load (and if that fetch ever fails), so there's no flash of
// empty content and the page still reads correctly with zero backend.
const DEFAULT_RESTAURANT = {
  name: "RMS",
  address: "123 Jalan Example, 50000 Kuala Lumpur",
  hours: "Open daily · 11:00 AM – 10:00 PM",
  phone: "+60 12-345 6789",
};

const Landing = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [brokenImageIds, setBrokenImageIds] = useState(() => new Set());
  const [restaurant, setRestaurant] = useState(DEFAULT_RESTAURANT);

  document.title = restaurant.name;

  useEffect(() => {
    getPublicMenu()
      .then((res) => setMenuItems((res.items || []).filter((item) => item.status !== "unavailable")))
      .catch(() => setMenuItems([]))
      .finally(() => setLoadingMenu(false));

    getPublicSettings()
      .then((res) => {
        if (!res.settings) return;
        setRestaurant({
          name: res.settings.name || DEFAULT_RESTAURANT.name,
          address: res.settings.address || DEFAULT_RESTAURANT.address,
          hours: res.settings.hours || DEFAULT_RESTAURANT.hours,
          phone: res.settings.phone || DEFAULT_RESTAURANT.phone,
        });
      })
      .catch(() => {});
  }, []);

  const markImageBroken = (itemId) => {
    setBrokenImageIds((prev) => new Set(prev).add(itemId));
  };

  // Only surface a curated handful, not the entire menu.
  const signatureDishes = menuItems.slice(0, 3);
  // Reuse any real uploaded photo for the About section, independent of which
  // 3 items happen to be "signature" this round.
  const aboutPhoto = menuItems.find((item) => item.imageUrl);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <a href="#top" className="landing-nav-logo">{restaurant.name}</a>
        <ul className="landing-nav-links">
          <li><a href="#menu">Menu</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#location">Location</a></li>
        </ul>
        <a href="#location" className="btn-ghost-cta">
          <i className="mdi mdi-map-marker"></i> Find Us
        </a>
      </nav>

      <header id="top" className="landing-hero">
        <p className="landing-eyebrow">Fresh &middot; Local &middot; Everyday</p>
        <h1 className="landing-display">
          <span>Good Food</span>
          <span>(Made Fresh)</span>
        </h1>
        <div className="landing-cta-row">
          <a href="#menu" className="btn-primary-cta">View Menu &rarr;</a>
          <a href="#location" className="btn-ghost-cta">
            <i className="mdi mdi-map-marker"></i> Find Us
          </a>
        </div>
      </header>

      <section id="menu" className="landing-section">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Signature Dishes</p>
          <h2 className="landing-section-title">Taste the Difference</h2>
        </div>

        {loadingMenu ? (
          <p className="landing-menu-status">Loading menu&hellip;</p>
        ) : signatureDishes.length === 0 ? (
          <p className="landing-menu-status">Menu coming soon.</p>
        ) : (
          <div className="landing-grid">
            {signatureDishes.map((item) => {
              const hasImage = item.imageUrl && !brokenImageIds.has(item.id);
              return (
                <div className="landing-card" key={item.id}>
                  <div className="landing-card-image-wrap">
                    {hasImage ? (
                      <img src={item.imageUrl} alt={item.name} onError={() => markImageBroken(item.id)} />
                    ) : (
                      <div className="landing-card-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M7 3v7a2 2 0 0 0 2 2v9M7 3a2 2 0 0 0-2 2v5M7 3a2 2 0 0 1 2 2v5M17 3v18M17 3a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="landing-card-top">
                    <h3 className="landing-card-name">{item.name}</h3>
                    <span className="landing-card-price">RM {Number(item.price).toFixed(2)}</span>
                  </div>
                  {item.description ? <p className="landing-card-desc">{item.description}</p> : null}
                  <a href="#location" className="ghost-link">View location &rarr;</a>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section id="why-us" className="landing-section">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Why Choose Us</p>
          <h2 className="landing-section-title">What Makes Us Different</h2>
        </div>
        <div className="landing-values">
          <div className="landing-value">
            <div className="landing-value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C7 2 4 6 4 10c0 5 4 8 8 12 4-4 8-7 8-12 0-4-3-8-8-8Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8v6M9 11h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="landing-value-title">Fresh Daily</h3>
            <p className="landing-value-desc">Ingredients sourced and prepped fresh every single day &mdash; nothing sits around.</p>
          </div>
          <div className="landing-value">
            <div className="landing-value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="landing-value-title">Fast Service</h3>
            <p className="landing-value-desc">Cooked to order and sent straight to the kitchen &mdash; no waiting on a server to relay it.</p>
          </div>
          <div className="landing-value">
            <div className="landing-value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="7" height="7" rx="1" />
                <rect x="13" y="4" width="7" height="7" rx="1" />
                <rect x="4" y="13" width="7" height="7" rx="1" />
                <path d="M15 15h2v2h-2zM19 15h1v1h-1zM15 19h1v1h-1zM18 18h2v2h-2z" />
              </svg>
            </div>
            <h3 className="landing-value-title">Easy Ordering</h3>
            <p className="landing-value-desc">Order at the counter, or scan the QR code at your table and order straight from your phone.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Scan &amp; Order</p>
          <h2 className="landing-section-title">How QR Ordering Works</h2>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number">1</div>
            <h3 className="landing-value-title">Scan</h3>
            <p className="landing-value-desc">Scan the QR code on your table to open our menu instantly &mdash; no app to download.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-number">2</div>
            <h3 className="landing-value-title">Browse &amp; Add</h3>
            <p className="landing-value-desc">Browse the full menu, pick your dishes, and add them to your cart.</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-number">3</div>
            <h3 className="landing-value-title">Order &amp; Enjoy</h3>
            <p className="landing-value-desc">Place your order &mdash; it goes straight to the kitchen, and you pay at the counter when it's ready.</p>
          </div>
        </div>
      </section>

      <section id="about" className="landing-section landing-split">
        <div className="landing-split-text">
          <p className="landing-eyebrow">Our Story</p>
          <h2 className="landing-section-title landing-split-title">Cooked with Care, Served with Pride</h2>
          <p className="landing-split-body">
            {restaurant.name} started as a small neighborhood kitchen with one simple idea: food tastes better when
            it&rsquo;s made fresh, every single day. We source local ingredients, cook everything to order,
            and keep our menu focused on the dishes we do best.
          </p>
          <p className="landing-split-body">
            Whether you&rsquo;re dining in, grabbing takeaway, or ordering from your table by QR code,
            you&rsquo;re getting the same food, made the same way, every time.
          </p>
        </div>
        <div className="landing-split-photo">
          {aboutPhoto ? (
            <img src={aboutPhoto.imageUrl} alt={aboutPhoto.name} />
          ) : (
            <div className="landing-card-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 3v7a2 2 0 0 0 2 2v9M7 3a2 2 0 0 0-2 2v5M7 3a2 2 0 0 1 2 2v5M17 3v18M17 3a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </section>

      <section id="location" className="landing-location-band">
        <div className="landing-section landing-location">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">Visit Us</p>
            <h2 className="landing-section-title">Find the Table</h2>
          </div>
          <p className="landing-location-body">
            {restaurant.address}<br />
            {restaurant.hours}<br />
            {restaurant.phone}
          </p>
          <a href="#top" className="btn-primary-cta">Back to Top &uarr;</a>
        </div>
      </section>

      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} {restaurant.name}. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
