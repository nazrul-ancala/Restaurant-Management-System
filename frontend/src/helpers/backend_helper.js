import axios from "axios";
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
// Content-Type explicitly set to undefined so the browser fills in the correct
// multipart/form-data boundary itself, overriding api_helper's global JSON default.
export const uploadMenuImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axios.post(url.UPLOAD_MENU_IMAGE, formData, {
    headers: { "Content-Type": undefined },
  });
};

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

// Public (customer QR ordering, no auth)
export const getPublicTable = (qrCode) => api.get(`${url.GET_PUBLIC_TABLE}/${qrCode}`);
export const getPublicMenu = () => api.get(url.GET_PUBLIC_MENU);
export const createPublicOrder = (data) => api.create(url.CREATE_PUBLIC_ORDER, data);

// Reports (Manager/Administrator only)
// api.get appends every key in `params` as-is, so undefined values must be
// dropped here first (an undefined would otherwise be sent literally as "undefined").
const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const getSalesReport = (params) => api.get(url.GET_SALES_REPORT, cleanParams(params));
export const getMenuPerformanceReport = (params) => api.get(url.GET_MENU_PERFORMANCE_REPORT, cleanParams(params));
export const getLowStockReport = () => api.get(url.GET_LOW_STOCK_REPORT);
export const getConsumptionReport = (params) => api.get(url.GET_CONSUMPTION_REPORT, cleanParams(params));
export const getWasteReport = (params) => api.get(url.GET_WASTE_REPORT, cleanParams(params));
export const getStaffSalesReport = (params) => api.get(url.GET_STAFF_SALES_REPORT, cleanParams(params));
export const getKitchenPerformanceReport = (params) => api.get(url.GET_KITCHEN_PERFORMANCE_REPORT, cleanParams(params));
