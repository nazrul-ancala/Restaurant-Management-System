import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getInventoryItems as getInventoryItemsApi,
  createInventoryItem as createInventoryItemApi,
  updateInventoryItem as updateInventoryItemApi,
  deleteInventoryItem as deleteInventoryItemApi,
  adjustInventoryStock as adjustInventoryStockApi,
} from "../../helpers/backend_helper";

export const getInventoryItems = createAsyncThunk(
  "inventory/getInventoryItems",
  async (_, { rejectWithValue }) => {
    try {
      return await getInventoryItemsApi();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  "inventory/createInventoryItem",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createInventoryItemApi(data);
      toast.success("Inventory item added", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to add inventory item";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  "inventory/updateInventoryItem",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateInventoryItemApi(id, data);
      toast.success("Inventory item updated", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to update inventory item";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "inventory/deleteInventoryItem",
  async (id, { rejectWithValue }) => {
    try {
      await deleteInventoryItemApi(id);
      toast.success("Inventory item deleted", { autoClose: 3000 });
      return { id };
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to delete inventory item";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const adjustInventoryStock = createAsyncThunk(
  "inventory/adjustInventoryStock",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adjustInventoryStockApi(id, data);
      toast.success("Stock adjusted", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to adjust stock";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);
