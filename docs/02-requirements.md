# Functional Requirements

## FR-01 User Authentication

Description:
The system shall allow employees to log in using their registered email and password.

Preconditions:
- User account exists.

Postconditions:
- User is authenticated.
- Appropriate role permissions are assigned.

---

## FR-02 Employee Management

Description:
Administrators shall be able to create, update, deactivate and manage employee accounts.

---

## FR-03 Menu Management

Description:
Managers shall be able to manage menu categories and menu items.

Functions:
- Create Menu Item
- Update Menu Item
- Delete Menu Item
- Mark Item Available/Unavailable

---

## FR-04 Table Management

Description:
Waiters shall be able to manage restaurant tables.

Functions:
- View Table Status
- Assign Customer
- Change Table Status
- Merge/Split Tables (Future)

---

## FR-05 Order Management

Description:
Waiters shall be able to create customer orders.

Preconditions:
- Table is occupied.

Postconditions:
- Order is created.
- Status = Pending.
- Kitchen receives the order.

The system shall support multiple order types.

Supported Types

- Dine-In
- Takeaway

Dine-In orders require a table.

Takeaway orders do not require a table.

FR-20

## Future

Customers may place orders by scanning a QR code.

---

## FR-06 Kitchen Management

Description:
Chefs shall be able to manage food preparation.

Order Status:

- Pending
- Preparing
- Ready
- Served
- Completed
- Cancelled

---

## FR-07 Payment Management

Description:
Cashiers shall be able to receive payments and generate receipts.

---

## FR-08 Inventory Management

The system shall manage inventory using stock movements.

Functions

- Record purchases
- Record sales deduction
- Record waste
- Record manual adjustments
- View movement history
---

## FR-09 Stock Movement

Every inventory change shall generate a stock movement record.

Movement Types

- Purchase
- Sale
- Waste
- Adjustment
- Return

FR-10 Waste Management

Managers shall record food waste.

Waste reasons include

- Burnt
- Expired
- Wrong Order
- Damaged

FR-11 Recipe Management

Managers shall define recipes for menu items.

Each recipe specifies

- Inventory Item
- Quantity
- Unit

## FR-11 Inventory Units

Inventory items shall support multiple units.

Examples

Piece

Gram

Kilogram

Liter

Bottle

Pack

## FR-09 Reporting

Description:
Managers shall be able to view:

- Daily Sales
- Monthly Sales
- Best Selling Menu
- Inventory Usage
- Low Stock Alerts


## FR-10 Waste Management

Managers shall be able to record food waste.

Waste Reasons

- Burnt

- Wrong Order

- Expired

- Customer Complaint

- Other