import { createSlice } from "@reduxjs/toolkit";
import {
  getInventoryItems, createInventoryItem, updateInventoryItem,
  deleteInventoryItem, adjustInventoryStock,
} from "./thunk";

export const initialState = {
  items: [],
  error: null,
  loading: false,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInventoryItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInventoryItems.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.loading = false;
        state.error = null;
      })
      .addCase(getInventoryItems.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload.item);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const updated = action.payload.item;
        state.items = state.items.map((i) => (i.id === updated.id ? updated : i));
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      })
      .addCase(adjustInventoryStock.fulfilled, (state, action) => {
        const updated = action.payload.item;
        state.items = state.items.map((i) => (i.id === updated.id ? updated : i));
      });
  },
});

export default inventorySlice.reducer;
