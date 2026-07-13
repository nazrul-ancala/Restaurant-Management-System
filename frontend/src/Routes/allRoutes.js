import React from "react";
import { Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Menu from "../pages/Menu";
import Tables from "../pages/Tables";
import Orders from "../pages/Orders";
import Kitchen from "../pages/Kitchen";
import Inventory from "../pages/Inventory";
import Payments from "../pages/Payments";
import Reports from "../pages/Reports";
import AuditLogs from "../pages/AuditLogs";
import Settings from "../pages/Settings";

import Login from "../pages/Authentication/Login";
import PublicOrder from "../pages/PublicOrder";
import Landing from "../pages/Landing";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/employees", component: <Employees /> },
  { path: "/menu", component: <Menu /> },
  { path: "/tables", component: <Tables /> },
  { path: "/orders", component: <Orders /> },
  { path: "/kitchen", component: <Kitchen /> },
  { path: "/inventory", component: <Inventory /> },
  { path: "/payments", component: <Payments /> },
  { path: "/reports", component: <Reports /> },
  { path: "/audit-logs", component: <AuditLogs /> },
  { path: "/settings", component: <Settings /> },

  // this route should be at the end of all other routes
  { path: "*", component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/", component: <Landing /> },
  { path: "/login", component: <Login /> },
  { path: "/order/table/:tableId", component: <PublicOrder /> },
];

export { authProtectedRoutes, publicRoutes };
