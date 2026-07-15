import React from "react";
import { ADMIN_ROLES, EMPLOYEES_ROLES, OPERATIONAL_ROLES, CHEF_ROLES, CASHIER_ROLES } from "../common/roles";

const Navdata = () => {
    const menuItems = [
        { label: "Overview", isHeader: true },
        { id: "dashboard", label: "Dashboard", icon: "ri-dashboard-2-line", link: "/dashboard", roles: ADMIN_ROLES },

        { label: "Operations", isHeader: true },
        { id: "orders", label: "Orders", icon: "ri-file-list-3-line", link: "/orders", roles: OPERATIONAL_ROLES },
        { id: "kitchen", label: "Kitchen", icon: "ri-fire-line", link: "/kitchen", roles: CHEF_ROLES },
        { id: "tables", label: "Tables", icon: "ri-table-2", link: "/tables", roles: OPERATIONAL_ROLES },
        { id: "menu", label: "Menu", icon: "ri-restaurant-2-line", link: "/menu", roles: ADMIN_ROLES },

        { label: "Management", isHeader: true },
        { id: "employees", label: "Employees", icon: "ri-team-line", link: "/employees", roles: EMPLOYEES_ROLES },
        { id: "inventory", label: "Inventory", icon: "ri-archive-line", link: "/inventory", roles: CHEF_ROLES },
        { id: "payments", label: "Payments", icon: "ri-bank-card-line", link: "/payments", roles: CASHIER_ROLES },
        { id: "reports", label: "Reports", icon: "ri-bar-chart-line", link: "/reports", roles: ADMIN_ROLES },

        { label: "System", isHeader: true },
        { id: "auditlogs", label: "Audit Logs", icon: "ri-file-shield-2-line", link: "/audit-logs", roles: ADMIN_ROLES },
        { id: "settings", label: "Settings", icon: "ri-settings-3-line", link: "/settings", roles: ADMIN_ROLES },
    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
