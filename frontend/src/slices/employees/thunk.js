import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getEmployees as getEmployeesApi,
  getRoles as getRolesApi,
  addNewEmployee as addNewEmployeeApi,
  updateEmployee as updateEmployeeApi,
  deactivateEmployee as deactivateEmployeeApi,
  activateEmployee as activateEmployeeApi,
  resetEmployeePassword as resetEmployeePasswordApi,
} from "../../helpers/backend_helper";

export const getEmployees = createAsyncThunk(
  "employees/getEmployees",
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployeesApi();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getRoles = createAsyncThunk(
  "employees/getRoles",
  async (_, { rejectWithValue }) => {
    try {
      return await getRolesApi();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addNewEmployee = createAsyncThunk(
  "employees/addNewEmployee",
  async (employee, { rejectWithValue }) => {
    try {
      const response = await addNewEmployeeApi(employee);
      toast.success("Employee created", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to create employee";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const deactivateEmployeeThunk = createAsyncThunk(
  "employees/deactivate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deactivateEmployeeApi(id);
      toast.success("Employee deactivated", { autoClose: 3000 });
      return response;
    } catch (error) {
      toast.error("Failed to deactivate employee", { autoClose: 3000 });
      return rejectWithValue(error);
    }
  }
);

export const activateEmployeeThunk = createAsyncThunk(
  "employees/activate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await activateEmployeeApi(id);
      toast.success("Employee activated", { autoClose: 3000 });
      return response;
    } catch (error) {
      toast.error("Failed to activate employee", { autoClose: 3000 });
      return rejectWithValue(error);
    }
  }
);

export const updateEmployeeThunk = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeApi(id, data);
      toast.success("Employee updated", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to update employee";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);

export const resetEmployeePasswordThunk = createAsyncThunk(
  "employees/resetPassword",
  async ({ id, password }, { rejectWithValue }) => {
    try {
      const response = await resetEmployeePasswordApi(id, password);
      toast.success("Password reset", { autoClose: 3000 });
      return response;
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to reset password";
      toast.error(message, { autoClose: 3000 });
      return rejectWithValue(message);
    }
  }
);
