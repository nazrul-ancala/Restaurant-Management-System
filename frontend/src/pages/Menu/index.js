import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Menu = () => {
  document.title = "Menu | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Menu" pageTitle="RMS" />
        <h1>Menu</h1>
      </Container>
    </div>
  );
};

export default Menu;
