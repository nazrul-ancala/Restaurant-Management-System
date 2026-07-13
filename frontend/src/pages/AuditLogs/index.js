import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const AuditLogs = () => {
  document.title = "Audit Logs | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Audit Logs" pageTitle="RMS" />
        <h1>Audit Logs</h1>
      </Container>
    </div>
  );
};

export default AuditLogs;
