import { createSlice } from "@reduxjs/toolkit";
import { getOrders, getTables, getMenuItems, createOrder, updateOrderStatus } from "./thunk";

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
      });
  },
});

export default ordersSlice.reducer;
