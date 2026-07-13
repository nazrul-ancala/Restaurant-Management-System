import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Reports = () => {
  document.title = "Reports | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Reports" pageTitle="RMS" />
        <h1>Reports</h1>
      </Container>
    </div>
  );
};

export default Reports;
