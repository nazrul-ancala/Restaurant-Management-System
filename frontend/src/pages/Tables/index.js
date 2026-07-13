import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Tables = () => {
  document.title = "Tables | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Tables" pageTitle="RMS" />
        <h1>Tables</h1>
      </Container>
    </div>
  );
};

export default Tables;
