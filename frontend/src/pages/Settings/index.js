import React, { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row, Button,
  Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback,
} from "reactstrap";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import { getMe, changeMyPassword, getRestaurantSettings, updateRestaurantSettings } from "../../helpers/backend_helper";

const Settings = () => {
  document.title = "Settings | RMS";
  const [profile, setProfile] = useState(null);
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setProfile(res.employee))
      .catch(() => toast.error("Failed to load profile", { autoClose: 3000 }));
    getRestaurantSettings()
      .then((res) => setRestaurantSettings(res.settings))
      .catch(() => toast.error("Failed to load restaurant settings", { autoClose: 3000 }));
  }, []);

  const togglePasswordModal = () => {
    setPasswordModal(!passwordModal);
    if (passwordModal) passwordValidation.resetForm();
  };

  const passwordValidation = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm your new password"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await changeMyPassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
        toast.success("Password changed", { autoClose: 3000 });
        resetForm();
        setPasswordModal(false);
      } catch (e) {
        toast.error(typeof e === "string" ? e : "Failed to change password", { autoClose: 3000 });
      }
    },
  });

  const restaurantValidation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: restaurantSettings?.name || "",
      address: restaurantSettings?.address || "",
      phone: restaurantSettings?.phone || "",
      hours: restaurantSettings?.hours || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await updateRestaurantSettings(values);
        setRestaurantSettings(res.settings);
        toast.success("Restaurant profile updated", { autoClose: 3000 });
      } catch (e) {
        toast.error(typeof e === "string" ? e : "Failed to update restaurant profile", { autoClose: 3000 });
      }
    },
  });

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Settings" pageTitle="Operations" />

        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">My Profile</h5>
                <Button color="secondary" outline size="sm" onClick={togglePasswordModal}>
                  <i className="ri-lock-password-line align-bottom me-1"></i> Change Password
                </Button>
              </CardHeader>
              <CardBody>
                {profile ? (
                  <>
                    <div className="mb-3">
                      <Label className="text-muted mb-1">Name</Label>
                      <p className="mb-0 fw-medium">{profile.name}</p>
                    </div>
                    <div className="mb-3">
                      <Label className="text-muted mb-1">Email</Label>
                      <p className="mb-0 fw-medium">{profile.email}</p>
                    </div>
                    <div className="mb-0">
                      <Label className="text-muted mb-1">Role</Label>
                      <p className="mb-0 fw-medium">{profile.role}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted mb-0">Loading&hellip;</p>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Restaurant Profile</h5>
              </CardHeader>
              <CardBody>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    restaurantValidation.handleSubmit();
                    return false;
                  }}
                >
                  <div className="mb-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      name="name"
                      id="name"
                      onChange={restaurantValidation.handleChange}
                      onBlur={restaurantValidation.handleBlur}
                      value={restaurantValidation.values.name}
                      invalid={restaurantValidation.touched.name && !!restaurantValidation.errors.name}
                    />
                    {restaurantValidation.touched.name && restaurantValidation.errors.name ? (
                      <FormFeedback type="invalid">{restaurantValidation.errors.name}</FormFeedback>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      type="textarea"
                      rows={2}
                      name="address"
                      id="address"
                      onChange={restaurantValidation.handleChange}
                      onBlur={restaurantValidation.handleBlur}
                      value={restaurantValidation.values.address}
                    />
                  </div>

                  <div className="mb-3">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      name="phone"
                      id="phone"
                      onChange={restaurantValidation.handleChange}
                      onBlur={restaurantValidation.handleBlur}
                      value={restaurantValidation.values.phone}
                    />
                  </div>

                  <div className="mb-3">
                    <Label htmlFor="hours">Operating Hours</Label>
                    <Input
                      name="hours"
                      id="hours"
                      placeholder="e.g. Mon-Sun 10am - 10pm"
                      onChange={restaurantValidation.handleChange}
                      onBlur={restaurantValidation.handleBlur}
                      value={restaurantValidation.values.hours}
                    />
                  </div>

                  <div className="text-end">
                    <Button type="submit" color="success" disabled={restaurantValidation.isSubmitting}>
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={passwordModal} toggle={togglePasswordModal} centered>
        <ModalHeader toggle={togglePasswordModal}>Change Password</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              passwordValidation.handleSubmit();
              return false;
            }}
          >
            <div className="mb-3">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                type="password"
                name="currentPassword"
                id="currentPassword"
                onChange={passwordValidation.handleChange}
                onBlur={passwordValidation.handleBlur}
                value={passwordValidation.values.currentPassword}
                invalid={passwordValidation.touched.currentPassword && !!passwordValidation.errors.currentPassword}
              />
              {passwordValidation.touched.currentPassword && passwordValidation.errors.currentPassword ? (
                <FormFeedback type="invalid">{passwordValidation.errors.currentPassword}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                type="password"
                name="newPassword"
                id="newPassword"
                onChange={passwordValidation.handleChange}
                onBlur={passwordValidation.handleBlur}
                value={passwordValidation.values.newPassword}
                invalid={passwordValidation.touched.newPassword && !!passwordValidation.errors.newPassword}
              />
              {passwordValidation.touched.newPassword && passwordValidation.errors.newPassword ? (
                <FormFeedback type="invalid">{passwordValidation.errors.newPassword}</FormFeedback>
              ) : null}
            </div>

            <div className="mb-3">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                onChange={passwordValidation.handleChange}
                onBlur={passwordValidation.handleBlur}
                value={passwordValidation.values.confirmPassword}
                invalid={passwordValidation.touched.confirmPassword && !!passwordValidation.errors.confirmPassword}
              />
              {passwordValidation.touched.confirmPassword && passwordValidation.errors.confirmPassword ? (
                <FormFeedback type="invalid">{passwordValidation.errors.confirmPassword}</FormFeedback>
              ) : null}
            </div>

            <div className="text-end">
              <Button type="submit" color="success" disabled={passwordValidation.isSubmitting}>
                Change Password
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Settings;
