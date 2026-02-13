# Shree Ram Textile ERP System

A comprehensive ERP dashboard system built with React and Tailwind CSS.

## 🚀 Features

- **Dashboard** - Overview with statistics, charts, and recent orders
- **User Management** - Create, edit, and manage users with role-based access
- **Role & Permissions** - Define roles and set granular permissions
- **Sales Orders** - Manage sales orders with detailed views
- **Work Orders** - Track work orders across departments
- **QC Monitoring** - Quality control tracking and monitoring
- **Responsive Design** - Fully responsive across all devices
- **Role-based Sidebar** - Dynamic navigation based on user role

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 🎨 Tech Stack

- **React** - UI framework
- **React Router** - Navigation and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library

## 📱 Pages Included

1. **Login** (`/login`)
   - Email/password authentication
   - Remember me functionality
   - Password visibility toggle

2. **Dashboard** (`/dashboard`)
   - Stats cards with trending indicators
   - Order status bar chart
   - QC rejection reasons pie chart
   - Production time line chart
   - Recent orders table

3. **User Management** (`/users`)
   - User list with role badges
   - Active/inactive toggle
   - Create user modal
   - Role-based filtering

4. **Role & Permissions** (`/roles`)
   - Role list with descriptions
   - Add role modal
   - Granular permissions (Access, Create, Read, Update, Delete)

5. **Sales Orders** (`/sales-orders`)
   - Sales order list with filters
   - Status badges
   - Work order status linking
   - Detailed order view

6. **Sales Order Details** (`/sales-orders/:id`)
   - Client details
   - Shipping information
   - Order items table
   - Document attachments
   - Commercial & pricing details

7. **Work Orders** (`/work-orders`)
   - Work order tracking
   - Department assignment
   - Priority levels
   - Delay tracking

8. **QC Monitoring** (`/qc`)
   - Quality control list
   - Priority filtering
   - Status tracking

## 🎯 Default Credentials

Use any email and password to login (authentication is simplified for demo purposes)

## 🎨 Color Scheme

- **Primary Red**: `#7F1D1D`
- **Light Red**: `#DC2626`
- **Success Green**: `#22c55e`
- **Warning Orange**: `#f97316`

## 📂 Project Structure

```
src/
├── components/
│   └── Layout.js         # Main layout with sidebar and header
├── pages/
│   ├── Login.js
│   ├── Dashboard.js
│   ├── UserManagement.js
│   ├── RolePermissions.js
│   ├── SalesOrders.js
│   ├── SalesOrderDetails.js
│   ├── WorkOrders.js
│   └── QCMonitoring.js
├── App.js                # Main app with routing
├── index.js              # Entry point
└── index.css             # Global styles with Tailwind

## 🔧 Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  brand: {
    red: '#B91C1C',
    darkRed: '#7F1D1D',
  }
}
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add route in `src/App.js`
3. Add menu item in `src/components/Layout.js`

## 📝 Notes

- All data is mock data for demonstration purposes
- Authentication is simplified (no backend required)
- State management uses React hooks
- Fully responsive design with mobile-first approach

## 🌟 Future Enhancements

- [ ] Backend integration
- [ ] Real authentication system
- [ ] Advanced filtering and search
- [ ] Export functionality
- [ ] Real-time notifications
- [ ] Print functionality
- [ ] More detailed analytics

## 📄 License

This project is created for demonstration purposes.

---

Built with ❤️ for Shree Ram Textile
```
