import React from "react";
import "./landing.scss";

const MENU_HIGHLIGHTS = [
  { icon: "🍜", name: "Nasi Lemak", price: "RM 18.00", desc: "Fragrant coconut rice, sambal, crispy anchovies, boiled egg." },
  { icon: "🍗", name: "Grilled Chicken Chop", price: "RM 22.00", desc: "Char-grilled chicken thigh, black pepper sauce, fries." },
  { icon: "🍢", name: "Chicken Satay", price: "RM 15.00", desc: "Skewered chicken, peanut sauce, ketupat, cucumber." },
  { icon: "🍧", name: "Cendol", price: "RM 8.00", desc: "Shaved ice, pandan jelly, coconut milk, gula melaka." },
];

const Landing = () => {
  document.title = "RMS";

  return (
    <div className="landing">
      <nav className="landing-nav">
        <a href="#top" className="landing-nav-logo">RMS</a>
        <ul className="landing-nav-links">
          <li><a href="#menu">Menu</a></li>
          <li><a href="#location">Location</a></li>
        </ul>
        <a href="#location" className="btn-ghost-cta">
          <i className="mdi mdi-map-marker"></i> Find Us
        </a>
      </nav>

      <header id="top" className="landing-hero">
        <p className="landing-eyebrow">Fresh &middot; Local &middot; Everyday</p>
        <h1 className="landing-display">
          <span>GOOD FOOD</span>
          <span>(MADE FRESH)</span>
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
          <p className="landing-eyebrow">&#9668; Signature Dishes &#9658;</p>
          <h2 className="landing-section-title">TASTE THE DIFFERENCE</h2>
        </div>
        <div className="landing-grid">
          {MENU_HIGHLIGHTS.map((item) => (
            <div className="landing-card" key={item.name}>
              <div className="landing-card-icon">{item.icon}</div>
              <h3 className="landing-card-name">{item.name}</h3>
              <p className="landing-card-price">{item.price}</p>
              <p className="landing-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="location" className="landing-section landing-location">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Visit Us</p>
          <h2 className="landing-section-title">FIND THE TABLE</h2>
        </div>
        <p className="landing-location-body">
          123 Jalan Example, 50000 Kuala Lumpur<br />
          Open daily &middot; 11:00 AM &ndash; 10:00 PM<br />
          +60 12-345 6789
        </p>
        <a href="#top" className="btn-primary-cta">Back to Top &uarr;</a>
      </section>

      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} RMS. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
