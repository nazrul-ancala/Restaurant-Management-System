# Entity Relationship Diagram (ERD)

## Overview

This document describes the database design for the Restaurant Management System.

The ERD models the core entities, their attributes, and relationships. It is derived from the Domain Model and Business Rules.

## ERD Diagram

```mermaid
erDiagram

    ROLE {
        int id PK
        string name
    }

    EMPLOYEE {
        int id PK
        int role_id FK
        string name
        string email
        string password
        string status
    }

    CUSTOMER {
        int id PK
        string name
        string phone
    }

    DINING_TABLE {
        int id PK
        string table_number
        int capacity
        string status
    }

    MENU_CATEGORY {
        int id PK
        string name
    }

    MENU_ITEM {
        int id PK
        int category_id FK
        string name
        decimal price
        string availability
    }

    CUSTOMER_ORDER {
        int id PK
        int customer_id FK
        int table_id FK
        int waiter_id FK
        string order_type
        string status
        datetime created_at
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int menu_item_id FK
        int quantity
        decimal unit_price
    }

    ROLE ||--o{ EMPLOYEE : has
    EMPLOYEE ||--o{ CUSTOMER_ORDER : creates
    CUSTOMER ||--o{ CUSTOMER_ORDER : places
    DINING_TABLE ||--o{ CUSTOMER_ORDER : assigned_to
    CUSTOMER_ORDER ||--|{ ORDER_ITEM : contains
    MENU_CATEGORY ||--o{ MENU_ITEM : contains
```

## Notes

### Primary Keys

- Every entity has a unique primary key (`id`).

### Foreign Keys

- `role_id` references `ROLE`.
- `category_id` references `MENU_CATEGORY`.
- `order_id` references `CUSTOMER_ORDER`.
- `menu_item_id` references `MENU_ITEM`.

### Business Constraints

- A dine-in order requires a table.
- A takeaway order does not require a table.
- An order must contain at least one order item.
- A menu item belongs to one category.