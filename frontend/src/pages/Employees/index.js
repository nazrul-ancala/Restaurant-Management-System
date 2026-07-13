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
import { getEmployees, getRoles, addNewEmployee, deactivateEmployeeThunk } from "../../slices/thunks";

const Employees = () => {
  document.title = "Employees | RMS";
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

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

  const toggleModal = () => setModal(!modal);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      email: "",
      password: "",
      roleId: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Enter a valid email").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      roleId: Yup.number().typeError("Select a role").positive("Select a role").required("Select a role"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(addNewEmployee({ ...values, roleId: Number(values.roleId) }));
      if (!result.error) {
        resetForm();
        setModal(false);
      }
    },
  });

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
        cell: (cell) =>
          cell.row.original.status === "active" ? (
            <Button
              size="sm"
              color="danger"
              outline
              onClick={() => dispatch(deactivateEmployeeThunk(cell.row.original.id))}
            >
              Deactivate
            </Button>
          ) : null,
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
                <Button color="primary" onClick={toggleModal}>
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
        <ModalHeader toggle={toggleModal}>Add Employee</ModalHeader>
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
                Create Employee
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Employees;
