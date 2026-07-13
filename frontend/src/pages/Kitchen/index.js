import React from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Kitchen = () => {
  document.title = "Kitchen | RMS";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Kitchen" pageTitle="RMS" />
        <h1>Kitchen</h1>
      </Container>
    </div>
  );
};

export default Kitchen;
