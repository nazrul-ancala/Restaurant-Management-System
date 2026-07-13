import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button, Alert,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import TableContainer from "../../Components/Common/TableContainer";
import {
  getInventoryItems, createInventoryItem, updateInventoryItem,
  deleteInventoryItem, adjustInventoryStock,
} from "../../slices/thunks";
import { PREVIEW_INVENTORY } from "../../common/previewInventory";

const NEW_CATEGORY_VALUE = "__new__";
const NEW_UNIT_VALUE = "__new__";
const COMMON_UNITS = ["kg", "g", "L", "mL", "pcs", "pack", "box", "can", "bottle"];

const MOVEMENT_TYPES = [
  { value: "received", label: "Received", sign: 1 },
  { value: "used", label: "Used", sign: -1 },
  { value: "waste", label: "Waste", sign: -1 },
  { value: "correction", label: "Correction (+/-)", sign: null },
];

const MOVEMENT_BADGE = {
  received: "success",
  used: "info",
  waste: "danger",
  correction: "secondary",
};

const Inventory = () => {
  document.title = "Inventory | RMS";
  const dispatch = useDispatch();

  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [addingNewUnit, setAddingNewUnit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const inventoryPageData = createSelector(
    (state) => state.Inventory,
    (state) => ({ items: state.items })
  );
  const { items } = useSelector(inventoryPageData);

  useEffect(() => {
    dispatch(getInventoryItems());
  }, [dispatch]);

  const sourceItems = items && items.length > 0 ? items : PREVIEW_INVENTORY;

  const allCategories = useMemo(() => {
    const set = new Set();
    sourceItems.forEach((item) => set.add(item.category || "Other"));
    return Array.from(set);
  }, [sourceItems]);

  const allUnits = useMemo(() => {
    const set = new Set(COMMON_UNITS);
    sourceItems.forEach((item) => item.unit && set.add(item.unit));
    return Array.from(set);
  }, [sourceItems]);

  const lowStockCount = useMemo(
    () => sourceItems.filter((item) => item.quantity <= item.reorderThreshold).length,
    [sourceItems]
  );

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      category: "",
      unit: "",
      reorderThreshold: "",
      costPerUnit: "",
      quantity: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      category: Yup.string().required("Category is required"),
      unit: Yup.string().required("Unit is required"),
      reorderThreshold: Yup.number().typeError("Enter a number").min(0, "Cannot be negative").required("Required"),
      costPerUnit: Yup.number().typeError("Enter a number").min(0, "Cannot be negative").required("Required"),
      quantity: editingItem
        ? Yup.number().notRequired()
        : Yup.number().typeError("Enter a number").min(0, "Cannot be negative").required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        name: values.name,
        category: values.category,
        unit: values.unit,
        reorderThreshold: Number(values.reorderThreshold),
        costPerUnit: Number(values.costPerUnit),
      };
      if (!editingItem) payload.quantity = Number(values.quantity);

      const result = editingItem
        ? await dispatch(updateInventoryItem({ id: editingItem.id, data: payload }))
        : await dispatch(createInventoryItem(payload));
      if (!result.error) {
        resetForm();
        setEditingItem(null);
        setModal(false);
      }
    },
  });

  const openAddModal = () => {
    setEditingItem(null);
    setAddingNewCategory(false);
    setAddingNewUnit(false);
    validation.resetForm();
    setModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setAddingNewCategory(false);
    setAddingNewUnit(false);
    validation.setValues({
      name: item.name || "",
      category: item.category || "",
      unit: item.unit || "",
      reorderThreshold: item.reorderThreshold ?? "",
      costPerUnit: item.costPerUnit ?? "",
      quantity: item.quantity ?? "",
    });
    setModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingItem(null);
      setAddingNewCategory(false);
      setAddingNewUnit(false);
    }
  };

  const handleCategorySelectChange = (e) => {
    const value = e.target.value;
    if (value === NEW_CATEGORY_VALUE) {
      setAddingNewCategory(true);
      validation.setFieldValue("category", "");
    } else {
      validation.setFieldValue("category", value);
    }
  };

  const handleUnitSelectChange = (e) => {
    const value = e.target.value;
    if (value === NEW_UNIT_VALUE) {
      setAddingNewUnit(true);
      validation.setFieldValue("unit", "");
    } else {
      validation.setFieldValue("unit", value);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteInventoryItem(deleteTarget.id));
    setDeleteTarget(null);
  };

  const adjustValidation = useFormik({
    enableReinitialize: true,
    initialValues: { type: "received", quantity: "", note: "" },
    validationSchema: Yup.object({
      type: Yup.string().oneOf(MOVEMENT_TYPES.map((t) => t.value)).required(),
      quantity: Yup.number()
        .typeError("Enter a number")
        .required("Required")
        .test("nonzero-or-positive", "Enter a non-zero quantity", function (value) {
          if (value === undefined || value === null || Number.isNaN(value)) return false;
          const { type } = this.parent;
          return type === "correction" ? value !== 0 : value > 0;
        }),
      note: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const typeInfo = MOVEMENT_TYPES.find((t) => t.value === values.type);
      const delta = typeInfo.sign === null ? Number(values.quantity) : typeInfo.sign * Math.abs(Number(values.quantity));
      const result = await dispatch(
        adjustInventoryStock({ id: adjustTarget.id, data: { type: values.type, delta, note: values.note } })
      );
      if (!result.error) {
        resetForm();
        setAdjustTarget(null);
      }
    },
  });

  const openAdjustModal = (item) => {
    adjustValidation.resetForm();
    setAdjustTarget(item);
  };
  const closeAdjustModal = () => setAdjustTarget(null);

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "name", enableColumnFilter: false },
      { header: "Category", accessorKey: "category", enableColumnFilter: false },
      {
        header: "Quantity",
        accessorKey: "quantity",
        enableColumnFilter: false,
        cell: (cell) => `${cell.getValue()} ${cell.row.original.unit}`,
      },
      {
        header: "Reorder Threshold",
        accessorKey: "reorderThreshold",
        enableColumnFilter: false,
        cell: (cell) => `${cell.getValue()} ${cell.row.original.unit}`,
      },
      {
        header: "Cost/Unit",
        accessorKey: "costPerUnit",
        enableColumnFilter: false,
        cell: (cell) => `RM ${Number(cell.getValue()).toFixed(2)}`,
      },
      {
        header: "Status",
        id: "status",
        enableColumnFilter: false,
        cell: (cell) => {
          const item = cell.row.original;
          const low = item.quantity <= item.reorderThreshold;
          return (
            <span className={`badge ${low ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}>
              {low ? "Low Stock" : "OK"}
            </span>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        enableColumnFilter: false,
        cell: (cell) => {
          const item = cell.row.original;
          return (
            <div className="d-flex gap-2">
              <Button size="sm" color="primary" outline onClick={() => openAdjustModal(item)} title="Adjust Stock">
                <i className="ri-scales-3-line"></i>
              </Button>
              <Button size="sm" color="secondary" outline onClick={() => setHistoryTarget(item)} title="History">
                <i className="ri-history-line"></i>
              </Button>
              <Button size="sm" color="secondary" outline onClick={() => openEditModal(item)} title="Edit">
                <i className="ri-edit-2-line"></i>
              </Button>
              <Button size="sm" color="danger" outline onClick={() => setDeleteTarget(item)} title="Delete">
                <i className="ri-delete-bin-line"></i>
              </Button>
            </div>
          );
        },
      },
    ],
    [dispatch]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Inventory" pageTitle="Operations" />

        {lowStockCount > 0 ? (
          <Alert color="warning" fade={false}>
            <i className="ri-error-warning-line align-bottom me-1"></i>
            {lowStockCount} item{lowStockCount === 1 ? "" : "s"} low on stock
          </Alert>
        ) : null}

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">Inventory Items</h5>
                <Button color="primary" onClick={openAddModal}>
                  <i className="ri-add-line align-bottom me-1"></i> Add Item
                </Button>
              </CardHeader>
              <CardBody>
                <TableContainer
                  columns={columns}
                  data={sourceItems}
                  isGlobalFilter={true}
                  customPageSize={10}
                  divClass="table-responsive table-card"
                  tableClass="align-middle table-nowrap"
                  theadClass="table-light"
                  SearchPlaceholder="Search inventory..."
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>{editingItem ? "Edit Item" : "Add Item"}</ModalHeader>
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
              <Label htmlFor="category">Category</Label>
              {addingNewCategory ? (
                <div className="d-flex gap-2">
                  <Input
                    name="category"
                    id="category"
                    placeholder="New category name"
                    autoFocus
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.category}
                    invalid={validation.touched.category && !!validation.errors.category}
                  />
                  <Button
                    type="button"
                    color="light"
                    className="text-nowrap"
                    onClick={() => {
                      setAddingNewCategory(false);
                      validation.setFieldValue("category", "");
                    }}
                  >
                    Choose existing
                  </Button>
                </div>
              ) : (
                <Input
                  type="select"
                  name="category"
                  id="category"
                  onChange={handleCategorySelectChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.category}
                  invalid={validation.touched.category && !!validation.errors.category}
                >
                  <option value="">Select a category</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ Add New Category</option>
                </Input>
              )}
              {validation.touched.category && validation.errors.category ? (
                <FormFeedback type="invalid" className="d-block">{validation.errors.category}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="unit">Unit</Label>
              {addingNewUnit ? (
                <div className="d-flex gap-2">
                  <Input
                    name="unit"
                    id="unit"
                    placeholder="Custom unit"
                    autoFocus
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.unit}
                    invalid={validation.touched.unit && !!validation.errors.unit}
                  />
                  <Button
                    type="button"
                    color="light"
                    className="text-nowrap"
                    onClick={() => {
                      setAddingNewUnit(false);
                      validation.setFieldValue("unit", "");
                    }}
                  >
                    Choose existing
                  </Button>
                </div>
              ) : (
                <Input
                  type="select"
                  name="unit"
                  id="unit"
                  onChange={handleUnitSelectChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.unit}
                  invalid={validation.touched.unit && !!validation.errors.unit}
                >
                  <option value="">Select a unit</option>
                  {allUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                  <option value={NEW_UNIT_VALUE}>+ Add Custom Unit</option>
                </Input>
              )}
              {validation.touched.unit && validation.errors.unit ? (
                <FormFeedback type="invalid" className="d-block">{validation.errors.unit}</FormFeedback>
              ) : null}
            </div>

            {!editingItem ? (
              <div className="mb-3">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="quantity"
                  id="quantity"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.quantity}
                  invalid={validation.touched.quantity && !!validation.errors.quantity}
                />
                {validation.touched.quantity && validation.errors.quantity ? (
                  <FormFeedback type="invalid">{validation.errors.quantity}</FormFeedback>
                ) : null}
              </div>
            ) : (
              <div className="mb-3 text-muted fs-13">
                To change stock on hand, use the "Adjust Stock" action instead.
              </div>
            )}

            <div className="mb-3">
              <Label htmlFor="reorderThreshold">Reorder Threshold</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                name="reorderThreshold"
                id="reorderThreshold"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.reorderThreshold}
                invalid={validation.touched.reorderThreshold && !!validation.errors.reorderThreshold}
              />
              {validation.touched.reorderThreshold && validation.errors.reorderThreshold ? (
                <FormFeedback type="invalid">{validation.errors.reorderThreshold}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="costPerUnit">Cost / Unit (RM)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                name="costPerUnit"
                id="costPerUnit"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.costPerUnit}
                invalid={validation.touched.costPerUnit && !!validation.errors.costPerUnit}
              />
              {validation.touched.costPerUnit && validation.errors.costPerUnit ? (
                <FormFeedback type="invalid">{validation.errors.costPerUnit}</FormFeedback>
              ) : null}
            </div>

            <div className="text-end">
              <Button type="submit" color="success" disabled={validation.isSubmitting}>
                {editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={!!adjustTarget} toggle={closeAdjustModal} centered>
        <ModalHeader toggle={closeAdjustModal}>
          Adjust Stock{adjustTarget ? ` — ${adjustTarget.name}` : ""}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              adjustValidation.handleSubmit();
              return false;
            }}
          >
            <div className="mb-3">
              <Label htmlFor="adjustType">Type</Label>
              <Input
                type="select"
                name="type"
                id="adjustType"
                onChange={adjustValidation.handleChange}
                onBlur={adjustValidation.handleBlur}
                value={adjustValidation.values.type}
              >
                {MOVEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Input>
            </div>

            <div className="mb-3">
              <Label htmlFor="adjustQuantity">
                {adjustValidation.values.type === "correction" ? "Adjustment (+/-)" : "Quantity"}
                {adjustTarget ? ` (${adjustTarget.unit})` : ""}
              </Label>
              <Input
                type="number"
                step="0.01"
                name="quantity"
                id="adjustQuantity"
                onChange={adjustValidation.handleChange}
                onBlur={adjustValidation.handleBlur}
                value={adjustValidation.values.quantity}
                invalid={adjustValidation.touched.quantity && !!adjustValidation.errors.quantity}
              />
              {adjustValidation.touched.quantity && adjustValidation.errors.quantity ? (
                <FormFeedback type="invalid">{adjustValidation.errors.quantity}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="adjustNote">Note (optional)</Label>
              <Input
                type="textarea"
                rows={2}
                name="note"
                id="adjustNote"
                onChange={adjustValidation.handleChange}
                onBlur={adjustValidation.handleBlur}
                value={adjustValidation.values.note}
              />
            </div>

            <div className="text-end">
              <Button type="submit" color="success" disabled={adjustValidation.isSubmitting}>
                Save Adjustment
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={!!historyTarget} toggle={() => setHistoryTarget(null)} centered>
        <ModalHeader toggle={() => setHistoryTarget(null)}>
          Stock History{historyTarget ? ` — ${historyTarget.name}` : ""}
        </ModalHeader>
        <ModalBody>
          {historyTarget && historyTarget.movements && historyTarget.movements.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {[...historyTarget.movements]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((movement) => (
                  <div key={movement.id} className="border rounded p-2 d-flex justify-content-between align-items-start">
                    <div>
                      <span className={`badge bg-${MOVEMENT_BADGE[movement.type] || "secondary"}-subtle text-${MOVEMENT_BADGE[movement.type] || "secondary"} me-2`}>
                        {movement.type}
                      </span>
                      {movement.note ? <div className="text-muted fs-13 mt-1">{movement.note}</div> : null}
                    </div>
                    <div className="text-end">
                      <div className={`fw-semibold ${movement.delta > 0 ? "text-success" : "text-danger"}`}>
                        {movement.delta > 0 ? "+" : ""}
                        {movement.delta} {historyTarget.unit}
                      </div>
                      <div className="text-muted fs-12">{new Date(movement.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-muted text-center py-3">No stock movements yet</div>
          )}
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

export default Inventory;
