# Business Rules

## User Management

BR-001
Only active employees can log into the system.

BR-002
Each employee has exactly one role.

---

## Table Management

BR-003
A table cannot have more than one active dine-in order.

BR-004
Only available tables can be assigned to customers.

BR-005
Completed orders automatically free the table.

---

## Order Management

BR-006
Every order must belong to exactly one table.

BR-007
Every order must contain at least one menu item.

BR-008
Completed orders cannot be edited.

BR-009
Cancelled orders cannot be completed.

BR-010
Only waiters can create customer orders.

BR-019

Dine-In orders require an assigned table.

BR-020

Takeaway orders shall not occupy a table.

---

## Kitchen

BR-011
Only chefs can update cooking status.

BR-012
Orders must follow this status flow:

Pending
→ Preparing
→ Ready
→ Served
→ Completed

Cancelled can occur before Completed.

BR-021

Inventory shall not increase when food is wasted.

BR-022

Waste records require a reason.

---

## Payments

BR-013
Only completed payments can close an order.

BR-014
Payment amount cannot exceed the outstanding balance.

---

## Inventory

BR-015
Inventory decreases only after an order is completed.

BR-016
Menu items cannot be ordered if marked unavailable.

BR-017
Inventory quantity cannot become negative.

BR-023

Each inventory item shall have exactly one unit.

BR-024

Stock calculations shall preserve units.

BR-025

Recipes define ingredient quantity using inventory units.

BR-028

Every inventory change shall create a Stock Movement record.

BR-029

Inventory shall never be modified directly.

BR-030

Inventory quantity is updated through Stock Movement only.

BR-031

Every Stock Movement has exactly one movement type.

BR-032

Waste records must create a Waste Stock Movement.

BR-033

Sales deductions follow Recipe quantities.

BR-034

Manual adjustments require a reason.

---

## Audit

BR-018
Every critical operation shall be recorded.

Examples:

- User Login
- Menu Price Updated
- Order Cancelled
- Payment Completed
- Inventory Adjustment



