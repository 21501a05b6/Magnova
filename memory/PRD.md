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
- **PO List Page**: Displays all line item attributes (SL No, PO_ID, P.O Date, Purchase Office, Vendor, Location, Brand, Model, Storage, Colour, IMEI, Qty, Rate, PO Value, Status, Actions)
- **Create PO Dialog**: Full line item support with all device details
- **View PO Details**: Dialog showing header info and line items table
- **PO Approval Workflow**: Review, Approve, Reject with reason

### ✅ Procurement Page (Complete - Updated Feb 2, 2025)
- **PO Auto-Populate**: Selecting PO auto-populates vendor, location, brand, model, storage, colour, rate
- **Line Item Selection**: Dropdown to select specific line item from PO
- **IMEI Recording**: Record individual IMEI against PO line items

### ✅ IMEI Inventory Page (Complete - Updated Feb 2, 2025)
- **Scan IMEI Dialog** with fields:
  - IMEI Number
  - **Action** (Inward Nova, Inward Magnova, **Outward Nova**, **Outward Magnova**, Dispatch, Mark Available)
  - **Customer Organization** dropdown (Nova/Magnova) - NEW
  - **Location** dropdown (populated from PO locations) - NEW
  - Organization
- **Status Filter**: Includes all action statuses including Outward Nova/Magnova
- **Search**: By IMEI or device model

### ✅ Logistics & Shipments Page (Complete - Updated Feb 2, 2025)
- **Create Shipment** with PO auto-populate:
  - PO Number selection
  - Auto-populated: Brand, Model
  - **Quantity Tracking**: Shows Total, Shipped, Available quantities
  - **Pickup Location** dropdown (from PO locations)
  - To Location dropdown
  - Transporter Name, Vehicle Number
  - Pickup Date, Expected Delivery
- **Status Update**: Edit button to update status (Pending, In Transit, Delivered, Cancelled)
- **Table Columns**: PO Number, Brand/Model, Transporter, Vehicle, Route, Qty, Status, Pickup Date, Actions

### ✅ UI/UX & Branding (Complete)
- Magnova Blue (#1e3a5f) & Orange (#f97316) color scheme
- Professional sidebar navigation
- Consistent styling across all components

---

## CRM-Style Data Linking (Complete)
All pages are now linked via PO Number:
1. **Purchase Orders** → Source of truth for all data
2. **Procurement** → Auto-populates from PO line items
3. **Inventory** → Location dropdown populated from POs
4. **Logistics** → Auto-populates brand/model, tracks shipped vs available quantity

---

## Pending / In Progress

### 🟠 P1 - High Priority
1. **Enhanced Payment Management**
   - Split payment support
   - Multi-party payments (Magnova → Nova, Nova → Vendor, Nova → 3rd party)
   - Payment status tracking

2. **Logistics Document Uploads**
   - E-way bill attachment
   - POD (Proof of Delivery) uploads

3. **Verify Other Module Functionality**
   - Test Invoices, Sales Orders pages

### 🟡 P2 - Medium Priority
4. **Configurable Approval Workflows**
5. **Reporting Module Build-out**
6. **Full Immutable Audit Trail**

### 🔵 P3 - Technical Debt
7. **Backend Refactoring**
   - Break monolithic `server.py` into modular structure
   - Separate routers and models

---

## Test Credentials

| Role | Email | Password | Organization |
|------|-------|----------|--------------|
| Admin | admin@magnova.com | admin123 | Magnova |
| Stores | stores@nova.com | nova123 | Nova |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/purchase-orders` | GET, POST | List/Create POs |
| `/api/purchase-orders/{po_number}` | GET | Get single PO with items |
| `/api/purchase-orders/{po_number}/approve` | POST | Approve/Reject PO |
| `/api/procurement` | GET, POST | Procurement records |
| `/api/inventory` | GET | IMEI inventory list |
| `/api/inventory/scan` | POST | Scan IMEI with new actions |
| `/api/logistics/shipments` | GET, POST | Shipments list/create |
| `/api/logistics/shipments/{id}/status` | PATCH | Update shipment status |

---

## Architecture

```
/app/
├── backend/
│   ├── server.py          # FastAPI app with all endpoints
│   └── tests/
│       ├── test_purchase_orders.py
│       └── test_crm_features.py
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── PurchaseOrdersPage.js
│       │   ├── ProcurementPage.js    # With PO auto-populate
│       │   ├── InventoryPage.js      # With new scan fields
│       │   └── LogisticsPage.js      # With status update
│       └── components/
│           └── POLineItemRow.js
└── memory/
    └── PRD.md
```

---

Last Updated: February 2, 2025
