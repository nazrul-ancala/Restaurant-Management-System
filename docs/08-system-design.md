# System Design

## Overview

The Restaurant Management System (RMS) is designed as a modular system where each module has a clear responsibility. Modules communicate through well-defined business processes while sharing a centralized database.

The system supports two ordering methods:

* Staff-assisted ordering
* Customer QR ordering

Both methods create the same type of order and follow the same kitchen, inventory, and payment workflows.

---

# System Modules

## 1. Authentication & Authorization

### Purpose

Authenticate employees and protect system resources.

### Users

* All Employees

### Responsibilities

* Login
* Logout
* JWT Authentication
* Role-Based Access Control
* Session Validation

### Dependencies

* Employee Management

---

## 2. Employee Management

### Purpose

Manage restaurant staff.

### Users

* Administrator

### Responsibilities

* Create Employee
* Update Employee
* Deactivate Employee
* Assign Roles
* Reset Password

### Roles

* Administrator
* Manager
* Waiter
* Chef
* Cashier

### Dependencies

* Authentication

---

## 3. Menu Management

### Purpose

Manage food and beverages available for sale.

### Users

* Manager

### Responsibilities

* Manage Categories
* Manage Menu Items
* Manage Pricing
* Upload Images
* Change Availability
* Configure Recipes

### Features

Categories

* Appetizers
* Main Course
* Desserts
* Drinks

Menu Item

* Name
* Description
* Price
* Image
* Preparation Time
* Availability

Availability

* Available
* Sold Out
* Hidden

### Dependencies

* Inventory
* Recipe

---

## 4. Table Management

### Purpose

Manage restaurant seating.

### Users

* Waiter
* Manager

### Responsibilities

* View Table Status
* Assign Customers
* Release Tables
* Reserve Tables (Future)

### Table Status

* Available
* Occupied
* Reserved
* Cleaning

### Dependencies

* Order Management

---

## 5. Order Management

### Purpose

Manage customer orders.

### Users

* Waiter
* Customer (QR)
* Manager

### Order Types

* Dine-In
* Takeaway

### Ordering Methods

* Waiter
* QR Code

### Responsibilities

* Create Order
* Edit Order
* Cancel Order
* Add Items
* Remove Items
* Calculate Total
* Send Order to Kitchen
* Track Order Status

### Order Status

* Pending
* Preparing
* Ready
* Served
* Completed
* Cancelled

### Dependencies

* Menu Management
* Kitchen
* Payment
* Inventory

---

## 6. QR Ordering

### Purpose

Allow customers to place orders directly from their table.

### Users

* Customer

### Workflow

Customer scans QR Code

↓

Table identified automatically

↓

Digital Menu displayed

↓

Customer selects items

↓

Order submitted

↓

Kitchen receives order

↓

Waiter serves food

### Features

* QR Code per table
* View Menu
* Add Items
* Remove Items
* Submit Order
* View Order Status
* Request Bill
* Call Waiter

### Business Rules

* QR Code is unique for each table.
* QR orders are dine-in orders.
* QR orders automatically assign the correct table.
* Customers cannot modify completed orders.

### Dependencies

* Table Management
* Order Management

---

## 7. Kitchen Management

### Purpose

Manage food preparation.

### Users

* Chef

### Responsibilities

* View Kitchen Queue
* Accept Orders
* Start Cooking
* Mark Ready
* Record Cooking Mistakes

### Kitchen Queue

* Pending
* Preparing

### Dependencies

* Order Management
* Inventory

---

## 8. Inventory Management

### Purpose

Track restaurant inventory.

### Users

* Manager

### Responsibilities

* View Inventory
* Manual Adjustment
* View Stock Levels
* Low Stock Alerts
* Record Purchases
* View Stock History

### Inventory Units

* Piece
* Gram
* Kilogram
* Milliliter
* Liter
* Bottle
* Pack
* Can

### Dependencies

* Recipe
* Purchasing
* Stock Movement

---

## 9. Recipe Management

### Purpose

Connect menu items to inventory consumption.

### Users

* Manager

### Responsibilities

* Create Recipe
* Edit Recipe
* Assign Ingredients
* Configure Ingredient Quantity

### Example

Chicken Burger

* Bun × 1
* Chicken Patty × 1
* Cheese × 20 g
* Lettuce × 10 g
* Sauce × 15 g

### Dependencies

* Inventory
* Menu

---

## 10. Purchasing

### Purpose

Manage inventory purchases.

### Users

* Manager

### Responsibilities

* Create Purchase Orders
* Receive Deliveries
* Update Inventory
* Manage Suppliers

### Dependencies

* Supplier
* Inventory

---

## 11. Stock Movement

### Purpose

Maintain inventory audit history.

### Movement Types

* Purchase
* Sale
* Waste
* Adjustment
* Return

### Responsibilities

* Record Inventory Changes
* Maintain Audit Trail
* Support Inventory Reports

### Dependencies

* Inventory
* Orders
* Purchasing
* Waste Records

---

## 12. Waste Management

### Purpose

Track inventory lost during operations.

### Users

* Manager
* Chef

### Responsibilities

* Record Waste
* Select Waste Reason
* Generate Waste Reports

### Waste Reasons

* Burnt Food
* Wrong Order
* Expired
* Damaged
* Customer Complaint

### Dependencies

* Inventory
* Stock Movement

---

## 13. Payment Management

### Purpose

Process customer payments.

### Users

* Cashier
* Waiter (Optional)

### Responsibilities

* Process Payment
* Split Payment
* Multiple Payment Methods
* Generate Receipt
* Refund

### Payment Methods

* Cash
* Debit Card
* Credit Card
* DuitNow QR

### Dependencies

* Orders

---

## 14. Reporting

### Purpose

Provide business insights.

### Users

* Manager

### Reports

Sales

* Daily
* Weekly
* Monthly

Menu

* Best Selling
* Worst Selling

Inventory

* Low Stock
* Consumption

Waste

* Daily Waste
* Monthly Waste

Employees

* Sales by Waiter
* Kitchen Performance

---

## 15. Audit Logging

### Purpose

Track important system activities.

### Users

* Administrator

### Records

* Login
* Logout
* Price Changes
* Inventory Adjustment
* Order Cancellation
* Payment
* Waste Record

---

# Module Dependencies

```text
Authentication
        │
        ▼
Employee Management

Menu Management
        │
        ▼
Recipe Management
        │
        ▼
Inventory Management
        │
        ▼
Stock Movement

Table Management
        │
        ▼
Order Management
        │
        ├──────────────► Kitchen Management
        │
        ├──────────────► Payment Management
        │
        └──────────────► Inventory Management

QR Ordering
        │
        ▼
Order Management

Purchasing
        │
        ▼
Inventory Management

Reporting
        ▲
        │
All Modules
```

---

# System Navigation

```text
Dashboard

├── Employees
│
├── Menu
│   ├── Categories
│   ├── Menu Items
│   └── Recipes
│
├── Tables
│
├── Orders
│
├── Kitchen
│
├── Inventory
│   ├── Inventory Items
│   ├── Stock Movements
│   ├── Purchases
│   └── Waste Records
│
├── Payments
│
├── Reports
│
├── Audit Logs
│
└── Settings
```

---

# Future Enhancements

Version 2 may include:

* Online Reservations
* Delivery Orders
* Loyalty Program
* Discount & Promotion Engine
* Multi-Branch Support
* Kitchen Display by Station
* Customer Accounts
* Online Payment Gateway
* Supplier Portal
* Mobile Application
