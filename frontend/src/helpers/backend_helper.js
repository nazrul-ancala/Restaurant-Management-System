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
export const activateEmployee = (id) => api.update(`${url.GET_EMPLOYEES}/${id}/activate`);
export const resetEmployeePassword = (id, password) =>
  api.update(`${url.GET_EMPLOYEES}/${id}/reset-password`, { password });

// Tables
export const getTables = () => api.get(url.GET_TABLES);
export const createTable = (data) => api.create(url.GET_TABLES, data);
export const updateTable = (id, data) => api.update(`${url.GET_TABLES}/${id}`, data);
export const deleteTable = (id) => api.delete(`${url.GET_TABLES}/${id}`);

// Menu
export const getMenuItems = () => api.get(url.GET_MENU_ITEMS);
export const createMenuItem = (data) => api.create(url.GET_MENU_ITEMS, data);
export const updateMenuItem = (id, data) => api.update(`${url.GET_MENU_ITEMS}/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`${url.GET_MENU_ITEMS}/${id}`);

// Orders
export const getOrders = () => api.get(url.GET_ORDERS);
export const createOrder = (data) => api.create(url.GET_ORDERS, data);
export const updateOrderStatus = (id, data) => api.update(`${url.GET_ORDERS}/${id}/status`, data);

// Inventory
export const getInventoryItems = () => api.get(url.GET_INVENTORY);
export const createInventoryItem = (data) => api.create(url.GET_INVENTORY, data);
export const updateInventoryItem = (id, data) => api.update(`${url.GET_INVENTORY}/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`${url.GET_INVENTORY}/${id}`);
export const adjustInventoryStock = (id, data) => api.update(`${url.GET_INVENTORY}/${id}/adjust`, data);
