import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import TableContainer from "../../Components/Common/TableContainer";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "../../slices/thunks";
import { PREVIEW_MENU_ITEMS } from "../../common/previewMenuItems";

const CATEGORY_ORDER_KEY = "rms-menu-category-order";
const NEW_CATEGORY_VALUE = "__new__";

const loadCategoryOrder = () => {
  try {
    const raw = localStorage.getItem(CATEGORY_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveCategoryOrder = (order) => {
  try {
    localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(order));
  } catch (e) {
    // ignore storage errors (e.g. private browsing quota)
  }
};

const Menu = () => {
  document.title = "Menu | RMS";
  const dispatch = useDispatch();

  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState(loadCategoryOrder);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const menuPageData = createSelector(
    (state) => state.Orders,
    (state) => ({ menuItems: state.menuItems })
  );
  const { menuItems } = useSelector(menuPageData);

  useEffect(() => {
    dispatch(getMenuItems());
  }, [dispatch]);

  const sourceItems = menuItems && menuItems.length > 0 ? menuItems : PREVIEW_MENU_ITEMS;

  const allCategories = useMemo(() => {
    const map = {};
    sourceItems.forEach((item) => {
      const category = item.category?.name || "Other";
      map[category] = (map[category] || 0) + 1;
    });
    return map;
  }, [sourceItems]);

  const orderedCategories = useMemo(() => {
    const known = Object.keys(allCategories);
    const ordered = categoryOrder.filter((c) => known.includes(c));
    const remaining = known.filter((c) => !ordered.includes(c));
    return [...ordered, ...remaining];
  }, [allCategories, categoryOrder]);

  // Default row order follows the category order/reorder above; users can still
  // override it by clicking any column header (TableContainer's built-in sorting).
  const tableData = useMemo(() => {
    return [...sourceItems].sort((a, b) => {
      const catA = a.category?.name || "Other";
      const catB = b.category?.name || "Other";
      const idxA = orderedCategories.indexOf(catA);
      const idxB = orderedCategories.indexOf(catB);
      if (idxA !== idxB) return idxA - idxB;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [sourceItems, orderedCategories]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      category: "",
      price: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      category: Yup.string().required("Category is required"),
      price: Yup.number().typeError("Enter a price").positive("Price must be greater than 0").required("Price is required"),
      description: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        name: values.name,
        category: values.category,
        price: Number(values.price),
        description: values.description || "",
        imageUrl: photoPreview || null,
      };
      const result = editingItem
        ? await dispatch(updateMenuItem({ id: editingItem.id, data: payload }))
        : await dispatch(createMenuItem(payload));
      if (!result.error) {
        resetForm();
        setEditingItem(null);
        setPhotoPreview(null);
        setModal(false);
      }
    },
  });

  const openAddModal = () => {
    setEditingItem(null);
    setPhotoPreview(null);
    setAddingNewCategory(false);
    validation.resetForm();
    setModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setPhotoPreview(item.imageUrl || null);
    setAddingNewCategory(false);
    validation.setValues({
      name: item.name || "",
      category: item.category?.name || "",
      price: item.price ?? "",
      description: item.description || "",
    });
    setModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingItem(null);
      setPhotoPreview(null);
      setAddingNewCategory(false);
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

  const moveCategory = (category, direction) => {
    const index = orderedCategories.indexOf(category);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= orderedCategories.length) return;
    const next = [...orderedCategories];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setCategoryOrder(next);
    saveCategoryOrder(next);
  };

  const openRename = (category) => setRenameTarget({ category, value: category });

  const submitRename = () => {
    if (!renameTarget) return;
    const { category, value } = renameTarget;
    const newName = value.trim();
    if (!newName || newName === category) {
      setRenameTarget(null);
      return;
    }
    // No backend yet, so these dispatches will fail gracefully (toast) and the
    // category name stays as-is until real persistence exists — matching the
    // same no-op-on-failure behavior as toggleAvailability below.
    sourceItems
      .filter((item) => (item.category?.name || "Other") === category)
      .forEach((item) => {
        dispatch(updateMenuItem({ id: item.id, data: { category: newName } }));
      });
    setRenameTarget(null);
  };

  const toggleAvailability = (item) => {
    const nextStatus = item.status === "unavailable" ? "available" : "unavailable";
    dispatch(updateMenuItem({ id: item.id, data: { status: nextStatus } }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => setPhotoPreview(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteMenuItem(deleteTarget.id));
    setDeleteTarget(null);
  };

  const columns = [
    {
      header: "",
      id: "photo",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (cell) => {
        const item = cell.row.original;
        return item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ width: 40, height: 40 }}>
            <i className="ri-restaurant-2-line text-muted"></i>
          </div>
        );
      },
    },
    { header: "Name", accessorKey: "name", enableColumnFilter: false },
    {
      header: "Description",
      accessorKey: "description",
      enableColumnFilter: false,
      cell: (cell) => <span className="text-muted fs-13">{cell.getValue() || "—"}</span>,
    },
    {
      header: "Category",
      accessorKey: "category.name",
      enableColumnFilter: false,
      cell: (cell) => cell.row.original.category?.name || "Other",
    },
    {
      header: "Price",
      accessorKey: "price",
      enableColumnFilter: false,
      cell: (cell) => `RM ${Number(cell.getValue()).toFixed(2)}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      enableColumnFilter: false,
      cell: (cell) => (
        <span className={`badge ${cell.getValue() === "unavailable" ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}>
          {cell.getValue() === "unavailable" ? "Unavailable" : "Available"}
        </span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (cell) => {
        const item = cell.row.original;
        return (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              color={item.status === "unavailable" ? "success" : "danger"}
              outline
              onClick={() => toggleAvailability(item)}
              title={item.status === "unavailable" ? "Mark available" : "Mark unavailable"}
            >
              <i className={item.status === "unavailable" ? "ri-checkbox-circle-line" : "ri-forbid-line"}></i>
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
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Menu" pageTitle="Operations" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Categories</h5>
              </CardHeader>
              <CardBody>
                {orderedCategories.length === 0 ? (
                  <div className="text-muted">No categories yet</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {orderedCategories.map((category, idx) => (
                      <div key={category} className="d-flex align-items-center gap-1 border rounded-2 px-2 py-1">
                        <span className="fw-medium">{category}</span>
                        <span className="badge bg-secondary-subtle text-secondary">{allCategories[category]}</span>
                        <Button
                          size="sm" color="link" className="p-0 px-1 text-muted"
                          onClick={() => moveCategory(category, -1)}
                          disabled={idx === 0}
                          title="Move up"
                        >
                          <i className="ri-arrow-up-line"></i>
                        </Button>
                        <Button
                          size="sm" color="link" className="p-0 px-1 text-muted"
                          onClick={() => moveCategory(category, 1)}
                          disabled={idx === orderedCategories.length - 1}
                          title="Move down"
                        >
                          <i className="ri-arrow-down-line"></i>
                        </Button>
                        <Button
                          size="sm" color="link" className="p-0 px-1 text-muted"
                          onClick={() => openRename(category)}
                          title="Rename category"
                        >
                          <i className="ri-edit-2-line"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">Menu Items</h5>
                <Button color="primary" onClick={openAddModal}>
                  <i className="ri-add-line align-bottom me-1"></i> Add Item
                </Button>
              </CardHeader>
              <CardBody>
                <TableContainer
                  columns={columns}
                  data={tableData}
                  isGlobalFilter={true}
                  customPageSize={10}
                  divClass="table-responsive table-card"
                  tableClass="align-middle table-nowrap"
                  theadClass="table-light"
                  SearchPlaceholder="Search menu items..."
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</ModalHeader>
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
                <>
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
                  {validation.touched.category && validation.errors.category ? (
                    <FormFeedback type="invalid" className="d-block">{validation.errors.category}</FormFeedback>
                  ) : null}
                </>
              ) : (
                <>
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
                    {Object.keys(allCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value={NEW_CATEGORY_VALUE}>+ Add New Category</option>
                  </Input>
                  {validation.touched.category && validation.errors.category ? (
                    <FormFeedback type="invalid">{validation.errors.category}</FormFeedback>
                  ) : null}
                </>
              )}
            </div>

            <div className="mb-3">
              <Label htmlFor="price">Price (RM)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                name="price"
                id="price"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.price}
                invalid={validation.touched.price && !!validation.errors.price}
              />
              {validation.touched.price && validation.errors.price ? (
                <FormFeedback type="invalid">{validation.errors.price}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="description">Description</Label>
              <Input
                type="textarea"
                rows={2}
                name="description"
                id="description"
                placeholder="Optional short description"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.description}
              />
            </div>

            <div className="mb-3">
              <Label htmlFor="photo">Photo</Label>
              <Input type="file" accept="image/*" id="photo" onChange={handlePhotoChange} />
              <div className="form-text">Preview only until image uploads are supported.</div>
              {photoPreview ? (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                  />
                  <Button size="sm" color="light" onClick={clearPhoto}>
                    Remove photo
                  </Button>
                </div>
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

      <Modal isOpen={!!renameTarget} toggle={() => setRenameTarget(null)} centered>
        <ModalHeader toggle={() => setRenameTarget(null)}>Rename Category</ModalHeader>
        <ModalBody>
          <Label htmlFor="rename-category">New category name</Label>
          <Input
            id="rename-category"
            value={renameTarget?.value || ""}
            onChange={(e) => setRenameTarget((prev) => ({ ...prev, value: e.target.value }))}
          />
          <div className="text-end mt-3">
            <Button color="light" className="me-2" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button color="success" onClick={submitRename}>
              Save
            </Button>
          </div>
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

export default Menu;
