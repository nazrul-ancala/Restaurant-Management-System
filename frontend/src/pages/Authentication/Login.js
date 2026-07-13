import React, { useEffect } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';

//redux
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// actions
import { loginUser, resetLoginFlag } from "../../slices/thunks";

import logoLight from "../../assets/images/logo-light.png";
import { createSelector } from 'reselect';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loginpageData = createSelector(
        (state) => state.Login,
        (state) => ({
            error: state.error,
            loading: state.loading,
            errorMsg: state.errorMsg,
        })
    );
    const { error, loading, errorMsg } = useSelector(loginpageData);

    const validation = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Please enter a valid email").required("Please Enter Your Email"),
            password: Yup.string().required("Please Enter Your Password"),
        }),
        onSubmit: (values) => {
            dispatch(loginUser(values, navigate));
        }
    });

    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
            }, 3000);
        }
    }, [dispatch, errorMsg]);

    document.title = "Sign In | RMS";

    return (
        <React.Fragment>
            <div className="auth-page-content mt-lg-5">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mt-sm-5 mb-4">
                                <div>
                                    <img src={logoLight} alt="" height="20" />
                                </div>
                                <p className="mt-3 fs-15 fw-medium">Restaurant Management System</p>
                            </div>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="mt-4">
                                <CardBody className="p-4">
                                    <div className="text-center mt-2">
                                        <h5 className="text-primary">Welcome Back !</h5>
                                        <p className="text-muted">Sign in to continue.</p>
                                    </div>
                                    {error ? (<Alert color="danger"> {error} </Alert>) : null}
                                    <div className="p-2 mt-4">
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                validation.handleSubmit();
                                                return false;
                                            }}
                                        >
                                            <div className="mb-3">
                                                <Label htmlFor="email" className="form-label">Email</Label>
                                                <Input
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Enter email"
                                                    type="email"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.email || ""}
                                                    invalid={
                                                        validation.touched.email && validation.errors.email ? true : false
                                                    }
                                                />
                                                {validation.touched.email && validation.errors.email ? (
                                                    <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                                                ) : null}
                                            </div>

                                            <div className="mb-3">
                                                <Label className="form-label" htmlFor="password-input">Password</Label>
                                                <div className="position-relative auth-pass-inputgroup mb-3">
                                                    <Input
                                                        name="password"
                                                        value={validation.values.password || ""}
                                                        type="password"
                                                        className="form-control pe-5"
                                                        placeholder="Enter Password"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        invalid={
                                                            validation.touched.password && validation.errors.password ? true : false
                                                        }
                                                    />
                                                    {validation.touched.password && validation.errors.password ? (
                                                        <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Button color="success" disabled={loading} className="btn btn-success w-100" type="submit">
                                                    {loading ? <Spinner size="sm" className='me-2'> Loading... </Spinner> : null}
                                                    Sign In
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Login;
