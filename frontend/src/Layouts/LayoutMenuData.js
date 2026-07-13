import React from "react";

const Navdata = () => {
    const menuItems = [
        { label: "Overview", isHeader: true },
        { id: "dashboard", label: "Dashboard", icon: "ri-dashboard-2-line", link: "/dashboard" },

        { label: "Operations", isHeader: true },
        { id: "orders", label: "Orders", icon: "ri-file-list-3-line", link: "/orders" },
        { id: "kitchen", label: "Kitchen", icon: "ri-fire-line", link: "/kitchen" },
        { id: "tables", label: "Tables", icon: "ri-table-2", link: "/tables" },
        { id: "menu", label: "Menu", icon: "ri-restaurant-2-line", link: "/menu" },

        { label: "Management", isHeader: true },
        { id: "employees", label: "Employees", icon: "ri-team-line", link: "/employees" },
        { id: "inventory", label: "Inventory", icon: "ri-archive-line", link: "/inventory" },
        { id: "payments", label: "Payments", icon: "ri-bank-card-line", link: "/payments" },
        { id: "reports", label: "Reports", icon: "ri-bar-chart-line", link: "/reports" },

        { label: "System", isHeader: true },
        { id: "auditlogs", label: "Audit Logs", icon: "ri-file-shield-2-line", link: "/audit-logs" },
        { id: "settings", label: "Settings", icon: "ri-settings-3-line", link: "/settings" },
    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
