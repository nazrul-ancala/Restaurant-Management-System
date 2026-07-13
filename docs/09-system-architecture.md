# System Architecture

## Overview

The Restaurant Management System (RMS) follows a modular monolithic architecture using a feature-based organization.

Each business domain is implemented as an independent module with its own routes, controllers, services, repositories, validation, and business logic.

This approach improves maintainability, scalability, and code organization while remaining simple to deploy as a single application.

---

# Architecture Style

The system uses:

- Client-Server Architecture
- Modular Monolith
- Layered Design inside each module
- REST API
- Repository Pattern
- Role-Based Access Control (RBAC)

---

# High-Level Architecture

```text
                +----------------------+
                | Staff Dashboard      |
                | React + Vite         |
                +----------+-----------+
                           |
                           |
                HTTPS REST API
                           |
                           ▼
                +----------------------+
                | Express Backend      |
                | Modular Monolith     |
                +----------+-----------+
                           |
                           ▼
                     Prisma ORM
                           |
                           ▼
                     PostgreSQL
```

---

# Backend Architecture

Every feature owns its own files.

```text
Module

↓

Routes

↓

Controller

↓

Service

↓

Repository

↓

Prisma
```

Business logic never exists inside Controllers.

Database queries never exist inside Controllers.

---

# Backend Folder Structure

```text
backend/

src/

├── modules/
│
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.types.ts
│   │   └── index.ts
│   │
│   ├── employees/
│   │   ├── employee.routes.ts
│   │   ├── employee.controller.ts
│   │   ├── employee.service.ts
│   │   ├── employee.repository.ts
│   │   ├── employee.validation.ts
│   │   └── index.ts
│   │
│   ├── menu/
│   │
│   ├── tables/
│   │
│   ├── orders/
│   │
│   ├── kitchen/
│   │
│   ├── inventory/
│   │
│   ├── recipes/
│   │
│   ├── purchasing/
│   │
│   ├── stock-movement/
│   │
│   ├── waste/
│   │
│   ├── payments/
│   │
│   ├── reports/
│   │
│   └── qr-ordering/
│
├── prisma/
│
├── middleware/
│
├── config/
│
├── lib/
│
├── utils/
│
├── types/
│
├── constants/
│
├── app.ts
│
└── server.ts
```

---

# Frontend Architecture

The frontend also follows feature-based organization.

```text
frontend/

src/

├── modules/
│
│   ├── auth/
│   │
│   ├── dashboard/
│   │
│   ├── employees/
│   │
│   ├── menu/
│   │
│   ├── tables/
│   │
│   ├── orders/
│   │
│   ├── kitchen/
│   │
│   ├── inventory/
│   │
│   ├── purchasing/
│   │
│   ├── payments/
│   │
│   ├── reports/
│   │
│   └── qr-ordering/
│
├── components/
│
├── layouts/
│
├── router/
│
├── hooks/
│
├── services/
│
├── lib/
│
├── utils/
│
└── main.tsx
```

---

# Module Responsibilities

Every module contains:

- Routes
- Controller
- Service
- Repository
- Validation
- Types
- Tests (Future)

Each module should be independent as much as possible.

---

# Module Communication

Modules communicate only through Services.

Example

```text
Order Module

↓

Inventory Service

↓

Stock Movement Service

↓

Payment Service

↓

Kitchen Service
```

A module should never directly manipulate another module's database tables.

---

# Shared Components

Common functionality is stored in shared folders.

```text
lib/

Database Connection

JWT

Logger

Socket.IO

Prisma

utils/

Helpers

Date Functions

Currency Formatter

constants/

Roles

Permissions

Order Status

Payment Status

Inventory Units
```

---

# Authentication

Authentication uses JWT.

Flow

Login

↓

Generate JWT

↓

Store Token

↓

Authenticated Request

↓

Verify Token

↓

Authorize User

---

# Authorization

Role-Based Access Control

Roles

- Administrator
- Manager
- Waiter
- Chef
- Cashier

Permissions are checked inside middleware before reaching controllers.

---

# Database Layer

Prisma ORM handles:

- CRUD
- Transactions
- Relations
- Migrations

Repositories are responsible for interacting with Prisma.

---

# Real-Time Communication

Socket.IO is used for:

- New QR Orders
- Kitchen Updates
- Order Status Changes
- Low Stock Alerts

---

# Security

The application includes:

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Request Validation
- Helmet
- CORS
- Rate Limiting
- Environment Variables

---

# Deployment

Frontend

- Vercel

Backend

- Railway / Render

Database

- PostgreSQL

Storage

- Local (Development)
- AWS S3 (Future)