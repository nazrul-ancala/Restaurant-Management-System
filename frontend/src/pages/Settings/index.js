import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Settings = () => {
  document.title = "Settings | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Settings" pageTitle="RMS" />
        <h1>Settings</h1>
      </Container>
    </div>
  );
};

export default Settings;
