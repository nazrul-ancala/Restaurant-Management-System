import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createSelector } from "reselect";
import { QRCodeSVG } from "qrcode.react";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import { getTables, getOrders, createTable, updateTable, deleteTable } from "../../slices/thunks";
import { PREVIEW_ORDERS } from "../../common/previewOrders";
import { TERMINAL_STATUSES } from "../../common/orderConstants";

// Preview rows shown only until the backend returns real tables — automatically
// replaced once getTables() actually returns something.
const PREVIEW_TABLES = [
  { id: 1, name: "Table 1", capacity: 2, status: "available" },
  { id: 2, name: "Table 2", capacity: 4, status: "available" },
  { id: 3, name: "Table 3", capacity: 4, status: "available" },
  { id: 4, name: "Table 4", capacity: 6, status: "available" },
];

const MANUAL_STATUSES = ["available", "reserved", "cleaning"];

const Tables = () => {
  document.title = "Tables | RMS";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qrTable, setQrTable] = useState(null);
  const [modal, setModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const tablesPageData = createSelector(
    (state) => state.Orders,
    (state) => ({ tables: state.tables, orders: state.orders })
  );
  const { tables, orders } = useSelector(tablesPageData);

  useEffect(() => {
    dispatch(getTables());
    dispatch(getOrders());
  }, [dispatch]);

  const displayTables = tables && tables.length > 0 ? tables : PREVIEW_TABLES;
  const sourceOrders = orders && orders.length > 0 ? orders : PREVIEW_ORDERS;

  const occupiedTableIds = useMemo(() => {
    const ids = new Set();
    sourceOrders.forEach((order) => {
      if (order.table?.id && !TERMINAL_STATUSES.includes(order.status)) {
        ids.add(order.table.id);
      }
    });
    return ids;
  }, [sourceOrders]);

  const orderUrl = useMemo(() => {
    if (!qrTable) return "";
    return `${window.location.origin}/order/table/${qrTable.id}`;
  }, [qrTable]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      capacity: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      capacity: Yup.number().typeError("Enter a number").integer("Whole numbers only").positive("Capacity must be greater than 0").required("Capacity is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = { name: values.name, capacity: Number(values.capacity) };
      const result = editingTable
        ? await dispatch(updateTable({ id: editingTable.id, data: payload }))
        : await dispatch(createTable(payload));
      if (!result.error) {
        resetForm();
        setEditingTable(null);
        setModal(false);
      }
    },
  });

  const openAddModal = () => {
    setEditingTable(null);
    validation.resetForm();
    setModal(true);
  };

  const openEditModal = (table) => {
    setEditingTable(table);
    validation.setValues({ name: table.name || "", capacity: table.capacity ?? "" });
    setModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) setEditingTable(null);
  };

  const handleStatusChange = (table, status) => {
    dispatch(updateTable({ id: table.id, data: { status } }));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteTable(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Tables" pageTitle="Operations" />

        <Row className="mb-3">
          <Col xs={12} className="text-end">
            <Button color="primary" onClick={openAddModal}>
              <i className="ri-add-line align-bottom me-1"></i> Add Table
            </Button>
          </Col>
        </Row>

        <Row className="g-3">
          {displayTables.map((table) => {
            const occupied = occupiedTableIds.has(table.id);
            return (
              <Col key={table.id} xl={3} md={4} sm={6} xs={12}>
                <Card className="h-100 mb-0">
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold">{table.name}</span>
                    <div className="d-flex align-items-center gap-2">
                      {occupied ? (
                        <span className="badge bg-danger-subtle text-danger">Occupied</span>
                      ) : (
                        <span className="badge bg-success-subtle text-success">{table.status || "available"}</span>
                      )}
                      <Button size="sm" color="secondary" outline onClick={() => openEditModal(table)} title="Edit">
                        <i className="ri-edit-2-line"></i>
                      </Button>
                      <Button size="sm" color="danger" outline onClick={() => setDeleteTarget(table)} title="Delete">
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p className="text-muted mb-3">Seats {table.capacity}</p>

                    {occupied ? (
                      <Button color="danger" outline size="sm" className="w-100 mb-2" onClick={() => navigate("/orders")}>
                        <i className="ri-file-list-3-line align-bottom me-1"></i> View Order
                      </Button>
                    ) : (
                      <Input
                        type="select"
                        bsSize="sm"
                        className="mb-2"
                        value={table.status || "available"}
                        onChange={(e) => handleStatusChange(table, e.target.value)}
                      >
                        {MANUAL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </Input>
                    )}

                    <Button color="primary" outline size="sm" className="w-100" onClick={() => setQrTable(table)}>
                      <i className="ri-qr-code-line align-bottom me-1"></i> View QR
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
          {displayTables.length === 0 ? (
            <Col xs={12}>
              <div className="text-muted text-center py-4">No tables yet</div>
            </Col>
          ) : null}
        </Row>
      </Container>

      <Modal isOpen={!!qrTable} toggle={() => setQrTable(null)} centered>
        <ModalHeader toggle={() => setQrTable(null)}>{qrTable?.name} — Order QR</ModalHeader>
        <ModalBody className="text-center">
          {qrTable ? (
            <>
              <div className="d-flex justify-content-center mb-3">
                <QRCodeSVG value={orderUrl} size={220} />
              </div>
              <p className="text-muted fs-13 mb-3 text-break">{orderUrl}</p>
              <Button color="secondary" outline onClick={() => window.print()}>
                <i className="ri-printer-line align-bottom me-1"></i> Print
              </Button>
            </>
          ) : null}
        </ModalBody>
      </Modal>

      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>{editingTable ? "Edit Table" : "Add Table"}</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <div className="mb-3">
              <Label htmlFor="name">Name</Label>
              <Input
                name="name"
                id="name"
                placeholder="e.g. Table 5"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.name}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              {validation.touched.name && validation.errors.name ? (
                <FormFeedback type="invalid">{validation.errors.name}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                type="number"
                step="1"
                min="1"
                name="capacity"
                id="capacity"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.capacity}
                invalid={validation.touched.capacity && !!validation.errors.capacity}
              />
              {validation.touched.capacity && validation.errors.capacity ? (
                <FormFeedback type="invalid">{validation.errors.capacity}</FormFeedback>
              ) : null}
            </div>

            <div className="text-end">
              <Button type="submit" color="success" disabled={validation.isSubmitting}>
                {editingTable ? "Save Changes" : "Add Table"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <DeleteModal
        show={!!deleteTarget}
        onDeleteClick={confirmDelete}
        onCloseClick={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Tables;
