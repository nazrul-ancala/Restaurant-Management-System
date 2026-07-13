import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Inventory = () => {
  document.title = "Inventory | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Inventory" pageTitle="RMS" />
        <h1>Inventory</h1>
      </Container>
    </div>
  );
};

export default Inventory;
