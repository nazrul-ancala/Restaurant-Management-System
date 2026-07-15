export const ADMIN_ROLES = ["Administrator", "Manager"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

// Per-page role groups, shared by the route guards (allRoutes.js) and the
// sidebar filter (LayoutMenuData.js) so both stay in sync.
export const EMPLOYEES_ROLES = ["Administrator"];
// Orders + Tables are shared floor visibility — small-restaurant staff often
// cover more than one role (e.g. the same person waits tables and cashiers),
// so every operational role sees the floor, not just the role that "owns" it.
export const OPERATIONAL_ROLES = [...ADMIN_ROLES, "Waiter", "Chef", "Cashier"];
export const CHEF_ROLES = [...ADMIN_ROLES, "Chef"];
export const CASHIER_ROLES = [...ADMIN_ROLES, "Cashier"];

// Each role's landing page — used for the post-login redirect, the catch-all
// route, and any route guard's redirect when a role hits a page it can't see.
const ROLE_HOME_ROUTE = {
  Administrator: "/dashboard",
  Manager: "/dashboard",
  Waiter: "/orders",
  Chef: "/kitchen",
  Cashier: "/payments",
};

export const getHomeRoute = (role) => ROLE_HOME_ROUTE[role] || "/orders";
