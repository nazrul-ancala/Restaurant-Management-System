import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getEmployees as getEmployeesApi,
  getRoles as getRolesApi,
  addNewEmployee as addNewEmployeeApi,
  deactivateEmployee as deactivateEmployeeApi,
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
