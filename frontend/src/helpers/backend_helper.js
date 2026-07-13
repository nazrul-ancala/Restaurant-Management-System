import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Auth
export const postLogin = (data) => api.create(url.POST_LOGIN, data);
export const getMe = () => api.get(url.GET_ME);

// Employees
export const getRoles = () => api.get(url.GET_ROLES);
export const getEmployees = () => api.get(url.GET_EMPLOYEES);
export const getEmployee = (id) => api.get(`${url.GET_EMPLOYEES}/${id}`);
export const addNewEmployee = (employee) => api.create(url.GET_EMPLOYEES, employee);
export const updateEmployee = (id, employee) => api.update(`${url.GET_EMPLOYEES}/${id}`, employee);
export const deactivateEmployee = (id) => api.update(`${url.GET_EMPLOYEES}/${id}/deactivate`);
export const resetEmployeePassword = (id, password) =>
  api.update(`${url.GET_EMPLOYEES}/${id}/reset-password`, { password });

// Tables
export const getTables = () => api.get(url.GET_TABLES);

// Menu
export const getMenuItems = () => api.get(url.GET_MENU_ITEMS);

// Orders
export const getOrders = () => api.get(url.GET_ORDERS);
export const createOrder = (data) => api.create(url.GET_ORDERS, data);
export const updateOrderStatus = (id, data) => api.update(`${url.GET_ORDERS}/${id}/status`, data);
