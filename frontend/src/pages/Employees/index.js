import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback, Alert,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import {
  getEmployees, getRoles, addNewEmployee, updateEmployeeThunk,
  deactivateEmployeeThunk, activateEmployeeThunk, resetEmployeePasswordThunk,
} from "../../slices/thunks";

const Employees = () => {
  document.title = "Employees | RMS";
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const employeesPageData = createSelector(
    (state) => state.Employees,
    (state) => ({
      employees: state.employees,
      roles: state.roles,
      error: state.error,
    })
  );
  const { employees, roles, error } = useSelector(employeesPageData);

  useEffect(() => {
    dispatch(getEmployees());
    dispatch(getRoles());
  }, [dispatch]);

  const toggleModal = () => {
    setModal(!modal);
    if (modal) setEditingEmployee(null);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setModal(true);
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: editingEmployee?.name || "",
      email: editingEmployee?.email || "",
      password: "",
      roleId: editingEmployee?.roleId ? String(editingEmployee.roleId) : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Enter a valid email").required("Email is required"),
      password: editingEmployee
        ? Yup.string().notRequired()
        : Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      roleId: Yup.number().typeError("Select a role").positive("Select a role").required("Select a role"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const result = editingEmployee
        ? await dispatch(
            updateEmployeeThunk({
              id: editingEmployee.id,
              data: { name: values.name, email: values.email, roleId: Number(values.roleId) },
            })
          )
        : await dispatch(addNewEmployee({ ...values, roleId: Number(values.roleId) }));
      if (!result.error) {
        resetForm();
        setEditingEmployee(null);
        setModal(false);
      }
    },
  });

  const openResetPasswordModal = (employee) => {
    setNewPassword("");
    setPasswordError("");
    setResetPasswordTarget(employee);
  };
  const closeResetPasswordModal = () => setResetPasswordTarget(null);

  const submitResetPassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    const result = await dispatch(resetEmployeePasswordThunk({ id: resetPasswordTarget.id, password: newPassword }));
    if (!result.error) {
      closeResetPasswordModal();
    }
  };

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "name", enableColumnFilter: false },
      { header: "Email", accessorKey: "email", enableColumnFilter: false },
      {
        header: "Role",
        accessorKey: "role.name",
        enableColumnFilter: false,
        cell: (cell) => cell.row.original.role?.name,
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => (
          <span className={`badge ${cell.getValue() === "active" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
            {cell.getValue()}
          </span>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        enableColumnFilter: false,
        cell: (cell) => {
          const employee = cell.row.original;
          const isActive = employee.status === "active";
          return (
            <div className="d-flex gap-2">
              <Button size="sm" color="secondary" outline onClick={() => openEditModal(employee)} title="Edit">
                <i className="ri-edit-2-line"></i>
              </Button>
              <Button size="sm" color="secondary" outline onClick={() => openResetPasswordModal(employee)} title="Reset Password">
                <i className="ri-key-2-line"></i>
              </Button>
              <Button
                size="sm"
                color={isActive ? "danger" : "success"}
                outline
                onClick={() =>
                  dispatch(isActive ? deactivateEmployeeThunk(employee.id) : activateEmployeeThunk(employee.id))
                }
                title={isActive ? "Deactivate" : "Activate"}
              >
                <i className={isActive ? "ri-forbid-line" : "ri-checkbox-circle-line"}></i>
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
        <BreadCrumb title="Employees" pageTitle="Management" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">All Employees</h5>
                <Button color="primary" onClick={() => { setEditingEmployee(null); setModal(true); }}>
                  <i className="ri-add-line align-bottom me-1"></i> Add Employee
                </Button>
              </CardHeader>
              <CardBody>
                {error ? (
                  <Alert color="danger" fade={false}>Failed to load data (are you an Administrator?)</Alert>
                ) : (
                  <TableContainer
                    columns={columns}
                    data={employees || []}
                    isGlobalFilter={true}
                    customPageSize={10}
                    divClass="table-responsive table-card"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light"
                    SearchPlaceholder="Search employees..."
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>{editingEmployee ? "Edit Employee" : "Add Employee"}</ModalHeader>
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
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.email}
                invalid={validation.touched.email && !!validation.errors.email}
              />
              {validation.touched.email && validation.errors.email ? (
                <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
              ) : null}
            </div>

            {!editingEmployee ? (
              <div className="mb-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.password}
                  invalid={validation.touched.password && !!validation.errors.password}
                />
                {validation.touched.password && validation.errors.password ? (
                  <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                ) : null}
              </div>
            ) : (
              <div className="mb-3 text-muted fs-13">
                To change this employee's password, use the "Reset Password" action instead.
              </div>
            )}

            <div className="mb-3">
              <Label htmlFor="roleId">Role</Label>
              <Input
                type="select"
                name="roleId"
                id="roleId"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.roleId}
                invalid={validation.touched.roleId && !!validation.errors.roleId}
              >
                <option value="">Select a role</option>
                {(roles || []).map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </Input>
              {validation.touched.roleId && validation.errors.roleId ? (
                <FormFeedback type="invalid">{validation.errors.roleId}</FormFeedback>
              ) : null}
            </div>

            <div className="text-end">
              <Button type="submit" color="success" disabled={validation.isSubmitting}>
                {editingEmployee ? "Save Changes" : "Create Employee"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <Modal isOpen={!!resetPasswordTarget} toggle={closeResetPasswordModal} centered>
        <ModalHeader toggle={closeResetPasswordModal}>
          Reset Password{resetPasswordTarget ? ` — ${resetPasswordTarget.name}` : ""}
        </ModalHeader>
        <ModalBody>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError("");
            }}
            invalid={!!passwordError}
          />
          {passwordError ? <FormFeedback type="invalid" className="d-block">{passwordError}</FormFeedback> : null}
          <div className="text-end mt-3">
            <Button color="success" onClick={submitResetPassword}>
              Reset Password
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Employees;
