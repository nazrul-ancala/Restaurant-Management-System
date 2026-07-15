# 🍽️ Restaurant Management System (RMS)

A full-stack, role-based operations platform for restaurants — covering menu, tables, orders, kitchen workflow, inventory, payments, and reporting in one system, with real-time updates and a full audit trail.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-backend-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-black?logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E%20tests-2EAD33?logo=playwright&logoColor=white)

## Overview

Many small and medium-sized restaurants still run on manual processes or disconnected tools — slow order processing, communication gaps between waiters and kitchen staff, inaccurate inventory, and little visibility into daily performance. RMS digitizes the full restaurant workflow into a single system: waiters and cashiers take orders, the kitchen sees them the moment they're placed, inventory adjusts automatically, and managers get real-time sales and stock reporting — with every important action recorded in an audit log.

This project was built to demonstrate end-to-end full-stack engineering: a typed Express/Prisma API with layered (controller → service → repository) modules, JWT-based role authorization, real-time updates over Socket.IO, a React/Redux admin dashboard, and Playwright end-to-end test coverage across the core workflows.

## Screenshots


## Key Features

**Auth & Role-Based Access Control**
- JWT authentication with per-route role authorization (`Administrator`, `Manager`, `Waiter`, `Chef`, `Cashier`)
- Employee management with role assignment

**Menu & Table Management**
- Categories and menu items with image upload (Multer) and client-side image resizing before upload
- Tables with capacity, live status, and a unique auto-generated QR code per table

**Order Workflow & Kitchen Display System**
- Dine-in and takeaway order flows with a full status lifecycle
- Kitchen Display System that receives new tickets in real time over Socket.IO — no polling
- Public, zero-login QR ordering surface: scanning a table's QR code opens a menu and lets a customer place an order directly

**Payments**
- Payment tracking by method and status, including refund reason/timestamp

**Inventory Management**
- Inventory items with reorder thresholds and cost tracking
- Full stock-movement history as an auditable trail of every stock change

**Reporting & Audit Logs**
- Sales dashboard and reports built with ApexCharts
- CSV export for reporting data
- System-wide audit log of employee actions (who did what, to what entity, when)

**Restaurant Settings**
- Configurable restaurant profile (name, address, phone, hours)

## Tech Stack

**Frontend**
| | |
|---|---|
| Framework | React 18, React Router 6 |
| State | Redux Toolkit |
| UI | Bootstrap 5 + Reactstrap (Velzon admin theme) |
| Forms | Formik + Yup |
| Charts | ApexCharts / react-apexcharts |
| Real-time | Socket.IO client |
| Other | Axios, qrcode.react, react-toastify |

**Backend**
| | |
|---|---|
| Runtime | Node.js, TypeScript (tsx) |
| Framework | Express 5 |
| Database / ORM | PostgreSQL + Prisma |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Uploads | Multer |
| Real-time | Socket.IO |

**DevOps & Testing**
| | |
|---|---|
| Containerization | Docker Compose (Postgres + backend + frontend) |
| E2E testing | Playwright (inventory, kitchen, menu, orders, payments, tables) |

## Architecture

Monorepo with three independently runnable apps:

```
restaurant-management-system/
├── backend/     # Express + TypeScript + Prisma API
│   ├── src/
│   │   ├── modules/       # one folder per domain: auth, employees, inventory,
│   │   │                  # menu, orders, public, reports, settings, tables, audit-logs
│   │   ├── middleware/    # authenticate.ts, authorize(...roles)
│   │   └── lib/           # jwt.ts, socket.ts
│   └── prisma/            # schema + migrations + seed
├── frontend/    # React 18 + Redux Toolkit (Velzon admin theme)
│   └── src/
│       ├── pages/         # Dashboard, Kitchen, Payments, Reports, PublicOrder, Landing, ...
│       └── common/        # csvExport.js, resizeImage.js, socket.js
├── e2e/         # Playwright end-to-end tests
├── docs/        # project vision, domain notes, architecture docs
└── docker-compose.yml
```

Each backend module follows a **controller → service → repository** pattern. Auth-protected routes run through `authenticate` + `authorize(...roles)` middleware; the `public` module is deliberately excluded from auth so customers can browse a menu and order by scanning a table's QR code without logging in.

## Roles & Permissions

| Role | Responsibilities |
|------|------------------|
| Administrator | Manage the entire system and user accounts |
| Manager | Monitor operations, reports, inventory, and menu |
| Waiter | Manage tables and customer orders |
| Chef | Process and update food preparation status |
| Cashier | Handle payments and complete orders |

## Running Tests

End-to-end tests (Playwright) require Postgres and the backend already running and seeded:

```bash
docker-compose up -d postgres
cd backend && npm run dev
cd backend && npm run db:seed   # first run / after a DB reset only

cd e2e
npm install
npx playwright install chromium

npm test              # headless
npm run test:ui        # Playwright UI mode
npm run test:headed    # headed browser
npm run report         # open the last HTML report
```

Coverage spans inventory, kitchen display, menu, orders, payments, and table workflows.

## Roadmap

RMS v1 deliberately scopes to a single-branch, in-house operations platform. Deferred for future versions:

- Expanded online ordering / delivery integration
- Dedicated mobile application
- Third-party payment gateway integration
- Multi-branch support
- Customer loyalty program


