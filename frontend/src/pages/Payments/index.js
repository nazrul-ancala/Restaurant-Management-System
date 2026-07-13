import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Payments = () => {
  document.title = "Payments | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Payments" pageTitle="RMS" />
        <h1>Payments</h1>
      </Container>
    </div>
  );
};

export default Payments;
