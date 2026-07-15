import React from "react";
import { Navigate } from "react-router-dom";

import { getLoggedinUser } from "../helpers/api_helper";
import { ADMIN_ROLES, EMPLOYEES_ROLES, OPERATIONAL_ROLES, CHEF_ROLES, CASHIER_ROLES, getHomeRoute } from "../common/roles";

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

const DefaultRedirect = () => {
  const role = getLoggedinUser()?.employee?.role;
  return <Navigate to={getHomeRoute(role)} />;
};

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard />, roles: ADMIN_ROLES },
  { path: "/employees", component: <Employees />, roles: EMPLOYEES_ROLES },
  { path: "/menu", component: <Menu />, roles: ADMIN_ROLES },
  { path: "/tables", component: <Tables />, roles: OPERATIONAL_ROLES },
  { path: "/orders", component: <Orders />, roles: OPERATIONAL_ROLES },
  { path: "/kitchen", component: <Kitchen />, roles: CHEF_ROLES },
  { path: "/inventory", component: <Inventory />, roles: CHEF_ROLES },
  { path: "/payments", component: <Payments />, roles: CASHIER_ROLES },
  { path: "/reports", component: <Reports />, roles: ADMIN_ROLES },
  { path: "/audit-logs", component: <AuditLogs />, roles: ADMIN_ROLES },
  { path: "/settings", component: <Settings />, roles: ADMIN_ROLES },

  // this route should be at the end of all other routes
  { path: "*", component: <DefaultRedirect /> },
];

const publicRoutes = [
  { path: "/", component: <Landing /> },
  { path: "/login", component: <Login /> },
  { path: "/order/table/:qrCode", component: <PublicOrder /> },
];

export { authProtectedRoutes, publicRoutes };
