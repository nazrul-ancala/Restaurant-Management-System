import { createSlice } from "@reduxjs/toolkit";
import {
  getEmployees, getRoles, addNewEmployee, deactivateEmployeeThunk,
  activateEmployeeThunk, updateEmployeeThunk,
} from "./thunk";

export const initialState = {
  employees: [],
  roles: [],
  error: null,
  loading: false,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.employees = action.payload.employees;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.roles = action.payload.roles;
      })
      .addCase(addNewEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload.employee);
      })
      .addCase(deactivateEmployeeThunk.fulfilled, (state, action) => {
        const updated = action.payload.employee;
        state.employees = state.employees.map((e) => (e.id === updated.id ? updated : e));
      })
      .addCase(activateEmployeeThunk.fulfilled, (state, action) => {
        const updated = action.payload.employee;
        state.employees = state.employees.map((e) => (e.id === updated.id ? updated : e));
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const updated = action.payload.employee;
        state.employees = state.employees.map((e) => (e.id === updated.id ? updated : e));
      });
  },
});

export default employeesSlice.reducer;
