import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getOrders as getOrdersApi,
  getTables as getTablesApi,
  getMenuItems as getMenuItemsApi,
  createOrder as createOrderApi,
  updateOrderStatus as updateOrderStatusApi,
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
