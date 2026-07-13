# User Stories

## Authentication

As an employee,
I want to log into the system,
so that I can access features based on my role.

Acceptance Criteria

- Valid login succeeds.
- Invalid login shows an error.
- User is redirected to the dashboard.

---

## Waiter

As a waiter,
I want to assign customers to available tables,
so that dining can begin.

Acceptance Criteria

- Only available tables can be assigned.
- Assigned table becomes Occupied.

---

As a waiter,
I want to create customer orders,
so that the kitchen can prepare food.

Acceptance Criteria

- At least one menu item selected.
- Total price calculated.
- Order status becomes Pending.
- Kitchen receives the order.

---

As a waiter,

I want to create a takeaway order,

so customers can collect food without occupying a table.

Acceptance Criteria

- Customer name is optional
- Table is not required
- Packaging required

## Chef

As a chef,
I want to view pending orders,
so I know what food needs to be prepared.

Acceptance Criteria

- Orders sorted by oldest first.
- Pending orders highlighted.

---

As a chef,
I want to update cooking status,
so that waiters know when food is ready.

Acceptance Criteria

- Status changes immediately.
- Waiters see updated status.

As a chef,

I want to report burnt food,

so inventory remains accurate.

---

## Cashier

As a cashier,
I want to receive customer payments,
so that orders can be completed.

Acceptance Criteria

- Outstanding balance calculated.
- Receipt generated.
- Order status becomes Completed.

---

## Manager

As a manager,
I want to monitor restaurant performance,
so that I can make business decisions.

Acceptance Criteria

- Dashboard displays sales.
- Dashboard displays popular menu items.
- Dashboard displays low stock alerts.

---

As a manager,

I want to record wasted food,

so inventory remains accurate.

Acceptance Criteria

- Waste reason required
- Quantity required
- Audit log created

---

As a manager,

I want inventory items to support different units,

so stock is measured correctly.

As a manager,

I want to see inventory movement history,

so I know why stock changed.

As a manager,

I want to manually adjust inventory,

so stock matches physical inventory.

As a manager,

I want to define recipes,

so inventory deductions happen automatically.