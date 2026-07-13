import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getOrders as getOrdersApi,
  getTables as getTablesApi,
  createTable as createTableApi,
  updateTable as updateTableApi,
  deleteTable as deleteTableApi,
  getMenuItems as getMenuItemsApi,
  createOrder as createOrderApi,
  updateOrderStatus as updateOrderStatusApi,
  createMenuItem as createMenuItemApi,
  updateMenuItem as updateMenuItemApi,
  deleteMenuItem as deleteMenuItemApi,
} from "../../helpers/backend_helper";

export const getOrders = createAsyncThunk("orders/getOrders", async (_, { rejectWithValue }) => {
  try {
    return await getOrdersApi();
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getTables = createAsyncThunk("orders/getTables", async (_, { rejectWithValue }) => {
  try {
    return await getTablesApi();
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const createTable = createAsyncThunk("orders/createTable", async (data, { rejectWithValue }) => {
  try {
    const response = await createTableApi(data);
    toast.success("Table added", { autoClose: 3000 });
    return response;
  } catch (error) {
    const message = typeof error === "string" ? error : "Failed to add table";
    toast.error(message, { autoClose: 3000 });
    return rejectWithValue(message);
  }
});

export const updateTable = createAsyncThunk("orders/updateTable", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await updateTableApi(id, data);
    toast.success("Table updated", { autoClose: 3000 });
    return response;
  } catch (error) {
    const message = typeof error === "string" ? error : "Failed to update table";
    toast.error(message, { autoClose: 3000 });
    return rejectWithValue(message);
  }
});

export const deleteTable = createAsyncThunk("orders/deleteTable", async (id, { rejectWithValue }) => {
  try {
    await deleteTableApi(id);
    toast.success("Table deleted", { autoClose: 3000 });
    return { id };
  } catch (error) {
    const message = typeof error === "string" ? error : "Failed to delete table";
    toast.error(message, { autoClose: 3000 });
    return rejectWithValue(message);
  }
});

export const getMenuItems = createAsyncThunk("orders/getMenuItems", async (_, { rejectWithValue }) => {
  try {
    return await getMenuItemsApi();
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const createOrder = createAsyncThunk("orders/createOrder", async (data, { rejectWithValue }) => {
  try {
    const response = await createOrderApi(data);
    toast.success("Order created", { autoClose: 3000 });
    return response;
  } catch (error) {
    const message = typeof error === "string" ? error : "Failed to create order";
    toast.error(message, { autoClose: 3000 });
    return rejectWithValue(message);
  }
});

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateOrderStatusApi(id, data);
      toast.success("Order status updated", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to update order status";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const createMenuItem = createAsyncThunk("orders/createMenuItem", async (data, { rejectWithValue }) => {
  try {
    const response = await createMenuItemApi(data);
    toast.success("Menu item added", { autoClose: 3000 });
    return response;
  } catch (error) {
    const message = typeof error === "string" ? error : "Failed to add menu item";
    toast.error(message, { autoClose: 3000 });
    return rejectWithValue(message);
  }
});

export const updateMenuItem = createAsyncThunk(
  "orders/updateMenuItem",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateMenuItemApi(id, data);
      toast.success("Menu item updated", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to update menu item";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk("orders/deleteMenuItem", async (id, { rejectWithValue }) => {
  try {
    await deleteMenuItemApi(id);
    toast.success("Menu item deleted", { autoClose: 3000 });
    return { id };
  } catch (error) {
    const message = typeof error === "string" ? error : "Failed to delete menu item";
    toast.error(message, { autoClose: 3000 });
    return rejectWithValue(message);
  }
});
