import { createSlice } from "@reduxjs/toolkit";
import {
  getOrders, getTables, getMenuItems, createOrder, updateOrderStatus,
  createMenuItem, updateMenuItem, deleteMenuItem,
  createTable, updateTable, deleteTable,
} from "./thunk";

export const initialState = {
  orders: [],
  tables: [],
  menuItems: [],
  error: null,
  loading: false,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.loading = false;
        state.error = null;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(getTables.fulfilled, (state, action) => {
        state.tables = action.payload.tables;
      })
      .addCase(getMenuItems.fulfilled, (state, action) => {
        state.menuItems = action.payload.items;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload.order);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload.order;
        state.orders = state.orders.map((o) => (o.id === updated.id ? updated : o));
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.menuItems.unshift(action.payload.item);
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const updated = action.payload.item;
        state.menuItems = state.menuItems.map((m) => (m.id === updated.id ? updated : m));
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.menuItems = state.menuItems.filter((m) => m.id !== action.payload.id);
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.tables.unshift(action.payload.table);
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        const updated = action.payload.table;
        state.tables = state.tables.map((t) => (t.id === updated.id ? updated : t));
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter((t) => t.id !== action.payload.id);
      });
  },
});

export default ordersSlice.reducer;
