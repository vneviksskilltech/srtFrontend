# Shree Ram Textile ERP - Screens Reference

## Complete Screen List with Routes

### 🔐 Authentication
| Screen | Route | File | Description |
|--------|-------|------|-------------|
| Login | `/login` | `src/pages/Login.js` | Email/password authentication with remember me |

### 📊 Main Section
| Screen | Route | File | Description |
|--------|-------|------|-------------|
| Dashboard | `/dashboard` | `src/pages/Dashboard.js` | Main dashboard with stats, charts & recent orders |
| User Management | `/users` | `src/pages/UserManagement.js` | Create, edit, delete users with role assignment |
| Role & Permissions | `/roles` | `src/pages/RolePermissions.js` | Manage roles with CRUD permissions |

### 📦 Operations
| Screen | Route | File | Description |
|--------|-------|------|-------------|
| Sales Orders | `/sales-orders` | `src/pages/SalesOrders.js` | List of all sales orders with filters |
| Sales Order Details | `/sales-orders/:id` | `src/pages/SalesOrderDetails.js` | Detailed view of specific sales order |
| Work Orders | `/work-orders` | `src/pages/WorkOrders.js` | Track work orders by department |
| QC Monitoring | `/qc` | `src/pages/QCMonitoring.js` | Quality control monitoring queue |

### 🎨 Components
| Component | File | Description |
|-----------|------|-------------|
| Layout | `src/components/Layout.js` | Main layout with sidebar & header |

---

## Screen Features

### 1. Login Page (`/login`)
**Screenshot:** Screenshot_2026-02-07_091356.png

**Features:**
- Email input field
- Password input field with show/hide toggle
- Remember me checkbox
- SRT logo and branding
- Form validation

**UI Elements:**
- Email icon
- Lock icon
- Eye/EyeOff icon for password visibility
- Red brand color scheme

---

### 2. Dashboard (`/dashboard`)
**Screenshots:** Screenshot_2026-02-07_091528.png, Screenshot_2026-02-07_091542.png

**Features:**
- 5 stat cards with trending indicators
  - Active Work Orders: 104 (9% up)
  - Pending Approvals: 10 (5% up)
  - In Production: 5 (9% up)
  - QC Rejected: 3 (8% down)
  - Ready for Dispatch: 26
- Order Status horizontal bar chart
- QC Rejection Reasons donut chart
- Production Time line chart
- Recent orders table

**UI Elements:**
- Stat cards with icons
- Trending up/down indicators
- Interactive charts (Recharts)
- Filter dropdowns
- Data table with actions

---

### 3. User Management (`/users`)
**Screenshots:** Screenshot_2026-02-07_091617.png, Screenshot_2026-02-07_091631.png

**Features:**
- User list table
- Create user modal
- Filter by status (All Users, Active, Inactive)
- Role badges (Admin, Production, QC, Packaging, Sales)
- Active/Inactive toggle switch
- Last login timestamp

**Table Columns:**
- Name
- Email
- Role (with colored badge)
- Active (toggle switch)
- Last Login
- Actions (view, edit, delete)

**Create User Form:**
- First Name (required)
- Second Name
- Email (required)
- Role dropdown (required)
- Active toggle

---

### 4. Role & Permissions (`/roles`)
**Screenshots:** Screenshot_2026-02-07_091648.png, Screenshot_2026-02-07_091703.png, Screenshot_2026-02-07_091815.png

**Features:**
- Roles list table
- Add role modal
- Permissions matrix with checkboxes
- Role descriptions

**Roles:**
- ADMIN - Full system access
- SALES - Customer inquiries, orders, invoicing
- PRODUCTION INCHARGE - Production planning & execution
- QC - Quality inspection & testing
- PACKAGING - Packing operations

**Permission Types:**
- Access
- Create
- Read
- Update
- Delete

**Modules:**
- Dashboard
- Sales Order
- Work Orders
- Dispatch
- Customer Feedback
- Reports

---

### 5. Sales Orders (`/sales-orders`)

**Features:**
- Sales orders list table
- Advanced filters
  - SO Number search
  - Client search
  - Date range picker
  - Status dropdown
  - Assigned sales dropdown
- Status badges (Imported, Under Review, WO Generated, In Production, Completed, Cancelled)
- WO Status (Linked, Not Created)

**Table Columns:**
- SO No
- Client Name
- Order Value (₹)
- Order Date
- Delivery Date
- Status (colored badge)
- WO Status (colored badge)
- Actions (view, delete)

---

### 6. Sales Order Details (`/sales-orders/:id`)

**Features:**
- Client details card
  - Company Name
  - GST Number
  - Contact Person
  - Phone
  - Email
- Shipping details card
  - Shipping Address
  - Delivery Contact
  - Phone
- SO Summary card
  - Sales Order number
  - Order Value
  - Order Date
  - Expected Delivery
- Order items table
  - Item Code
  - Description
  - Quantity
  - Unit
  - Remarks
- Attached files section
  - View, Download, Delete actions
- Commercial & Pricing Details
  - Base Amount
  - GST (18%)
  - Discount
  - Total Order Value
  - Advance Received status

---

### 7. Work Orders (`/work-orders`)

**Features:**
- Work orders list table
- Filters
  - WO Number search
  - Client search
  - Department dropdown
  - Status dropdown
  - Date range picker
- Priority badges (Low, Medium, High)
- Status badges
- Delay tracking

**Table Columns:**
- WO No
- SO No
- Client Name
- Assigned Dept
- Status (colored badge)
- Priority (colored badge)
- Start Date
- Expected Completion
- Delay (in days, highlighted in red)
- Actions (view, delete)

---

### 8. QC Monitoring (`/qc`)


**Features:**
- QC list table
- Filters
  - Status dropdown (In Production, Completed, Rejected)
  - Priority dropdown (High, Medium, Low)
- Priority-based sorting
- QC due tracking

**Table Columns:**
- WO No
- Client Name
- Department
- QC Due Since (in days)
- Priority (colored badge)
- Actions (view)

---

## Color Scheme

### Brand Colors
- **Primary Red:** `#7F1D1D` (Dark Red)
- **Light Red:** `#DC2626`
- **Accent Red:** `#EF4444`

### Status Colors
- **Imported:** Blue (`#3B82F6`)
- **Under Review:** Yellow (`#EAB308`)
- **WO Generated:** Purple (`#A855F7`)
- **In Production:** Orange (`#F97316`)
- **Completed:** Green (`#22C55E`)
- **Cancelled:** Red (`#EF4444`)

### Role Colors
- **Admin:** Dark Red (`#7F1D1D`)
- **Production:** Orange (`#F97316`)
- **QC:** Green (`#22C55E`)
- **Packaging:** Gray (`#6B7280`)
- **Sales:** Blue (`#3B82F6`)

### Priority Colors
- **Low:** Blue (`#3B82F6`)
- **Medium:** Yellow (`#EAB308`)
- **High:** Red (`#EF4444`)

---

## Navigation Flow

```
Login → Dashboard → [Operations/Management Screens]
                   ↓
                   User Management → Create/Edit User
                   ↓
                   Role & Permissions → Add/Edit Role
                   ↓
                   Sales Orders → Sales Order Details
                   ↓
                   Work Orders → View Work Order
                   ↓
                   QC Monitoring → QC Details
```

---

## Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

All screens are fully responsive and adapt to different screen sizes.

---

## Icons Used (Lucide React)

- LayoutDashboard - Dashboard
- Users - User Management
- ShieldCheck - Roles & Permissions
- ShoppingCart - Sales Orders
- FileText - Work Orders
- ClipboardCheck - QC
- Package - Packaging
- Truck - Dispatch
- MessageSquare - Customer Feedback
- Activity - Activity Logs
- Eye - View action
- Trash2 - Delete action
- UserCog - Edit user
- Plus - Add new
- X - Close modal
- Search - Search functionality
- Calendar - Date picker
- Bell - Notifications
- ArrowLeft - Back navigation
- Download - Download file

---

Built with React, Tailwind CSS, and Recharts for Shree Ram Textile
