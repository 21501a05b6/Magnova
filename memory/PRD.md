# Magnova-Nova Procurement & Sales Management System - PRD

## Original Problem Statement
Build a secure, audit-ready, IMEI-level inventory, procurement, and sales management system for two related organizations:
- **Magnova Exim Pvt. Ltd.** (Export sales)
- **Nova Enterprises** (Domestic procurement)

The system must provide end-to-end visibility from Purchase Order to Sales, with detailed modules for PO Management, Procurement, complex Payment flows, IMEI Lifecycle Tracking, Logistics, Invoicing, Sales, and Reporting.

## Core Requirements
- **Architecture:** Modular, service-based with centralized IMEI master, RBAC, and full audit trails
- **Security:** Role-based access, data segregation, Maker-Checker controls
- **Tech Stack:** MongoDB, FastAPI (Python), React, Tailwind CSS

---

## What's Been Implemented

### ✅ Authentication & Authorization (Complete)
- JWT-based authentication with secure token management
- User registration and login
- Role-based access control (Admin, Purchase, Approver, Stores, etc.)
- Organization-based data segregation (Magnova vs Nova)

### ✅ Dashboard (Complete)
- Overview statistics
- Quick links to all modules
- User profile display

### ✅ Purchase Order Management (Complete - Updated Feb 2, 2025)
- **PO List Page**: Displays PO Number, PO Date, Purchase Office, Created By, Qty, Total Value, Status, Actions
- **Create PO Dialog**: Full line item support with:
  - P.O Date (date picker)
  - Purchase Office (dropdown)
  - Line Items: SL No, Vendor, Location, Brand, Model, Storage, Colour, IMEI, Qty, Rate, PO Value
  - Auto-calculation of PO Value and Totals
  - Add/Remove line item functionality
- **View PO Details**: Dialog showing header info and line items table
- **PO Approval Workflow**: Review, Approve, Reject with reason

### ✅ Basic Module Scaffolding (Complete)
- Procurement page
- Payments page
- Inventory page
- Logistics page
- Invoices page
- Sales Orders page
- Reports page
- Users page

### ✅ UI/UX & Branding (Complete)
- Magnova Blue (#1e3a5f) & Orange (#f97316) color scheme
- Professional sidebar navigation
- Consistent styling across all components

### ✅ Training Materials (Complete)
- `/app/training_materials/TRAINING_GUIDE.md`
- `/app/training_materials/VIDEO_SCRIPT.md`
- `/app/training_materials/PRESENTATION_OUTLINE.md`

---

## Pending / In Progress

### 🔴 P0 - Critical
1. **IMEI Lifecycle Tracking**
   - UI for scanning IMEIs at different stages
   - Status flow: Procured → Inward Nova → In-Transit → Inward Magnova → Sold
   - Barcode/QR scanning integration

### 🟠 P1 - High Priority
2. **Enhanced Payment Management**
   - Split payment support
   - Multi-party payments (Magnova → Nova, Nova → Vendor, Nova → 3rd party)
   - Payment status tracking

3. **Logistics Document Uploads**
   - E-way bill attachment
   - POD (Proof of Delivery) uploads
   - Shipment tracking

4. **Verify Other Module Functionality**
   - Test Logistics, Invoices, Sales Orders pages
   - Ensure they're not just placeholders

### 🟡 P2 - Medium Priority
5. **Configurable Approval Workflows**
6. **Reporting Module Build-out**
7. **Full Immutable Audit Trail**

### 🔵 P3 - Technical Debt
8. **Backend Refactoring**
   - Break monolithic `server.py` into modular structure
   - Separate routers: `/routers/auth.py`, `/routers/purchase_orders.py`, etc.
   - Separate models: `/models/po.py`, `/models/user.py`, etc.

---

## Test Credentials

| Role | Email | Password | Organization |
|------|-------|----------|--------------|
| Admin | admin@magnova.com | admin123 | Magnova |
| Stores | stores@nova.com | nova123 | Nova |

Full credentials list: `/app/LOGIN_CREDENTIALS.md`

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/purchase-orders` | GET, POST | List/Create POs |
| `/api/purchase-orders/{po_number}` | GET | Get single PO |
| `/api/purchase-orders/{po_number}/approve` | POST | Approve/Reject PO |
| `/api/procurement` | GET, POST | Procurement records |
| `/api/payments` | GET, POST | Payment records |
| `/api/inventory` | GET, POST | IMEI inventory |
| `/api/logistics` | GET, POST | Shipments |
| `/api/invoices` | GET, POST | Invoices |
| `/api/sales-orders` | GET, POST | Sales orders |

---

## Database Collections

- `users` - User accounts
- `purchase_orders` - PO documents with line items
- `procurements` - Procurement records
- `payments` - Payment records
- `imei_inventory` - IMEI tracking
- `logistics` - Shipments
- `invoices` - Invoice records
- `sales_orders` - Sales orders
- `audit_logs` - Audit trail

---

## Architecture

```
/app/
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py          # Main FastAPI app
│   └── tests/
│       └── test_purchase_orders.py
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── Sidebar.js
│   │   │   ├── POLineItemRow.js
│   │   │   └── ui/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── pages/
│   └── craco.config.js
├── training_materials/
└── memory/
    └── PRD.md
```

---

Last Updated: February 2, 2025
