# Shree Ram Textile ERP - Setup Instructions

## 📦 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation Steps

1. **Extract the Project**
   Extract all files to your desired location.

2. **Install Dependencies**
   ```bash
   cd shree-ram-textile-erp
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   
   The application will open at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🎯 Login Credentials

Use any email and password to login (authentication is simplified for demo).

Example:
- Email: admin@example.com
- Password: password

## 📂 Project Structure

```
shree-ram-textile-erp/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   └── Layout.js           # Main layout with sidebar
│   ├── pages/
│   │   ├── Login.js            # Login page
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── UserManagement.js   # User CRUD operations
│   │   ├── RolePermissions.js  # Role & permissions management
│   │   ├── SalesOrders.js      # Sales orders list
│   │   ├── SalesOrderDetails.js # Detailed sales order view
│   │   ├── WorkOrders.js       # Work orders tracking
│   │   └── QCMonitoring.js     # QC monitoring
│   ├── App.js                  # Main app with routing
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # Documentation
```

## 🎨 Features Implemented

### ✅ All Screens from Screenshots
1. **Login Page** - Email/password authentication with remember me
2. **Dashboard** - Statistics, charts (Bar, Pie, Line), and orders table
3. **User Management** - Create, view, edit users with role assignment
4. **Role & Permissions** - CRUD operations with granular permissions
5. **Sales Orders** - List view with filtering and status tracking
6. **Sales Order Details** - Complete order information with files
7. **Work Orders** - Department-wise tracking with priorities
8. **QC Monitoring** - Quality control queue

### ✅ Advanced Features
- **Responsive Design** - Works on all screen sizes
- **Role-based Access** - Different user roles (Admin, Production, QC, etc.)
- **Dynamic Charts** - Using Recharts library
- **Collapsible Sidebar** - Space-saving navigation
- **Status Badges** - Color-coded status indicators
- **Toggle Switches** - For active/inactive states
- **Modal Dialogs** - For create/edit operations
- **Search & Filters** - Throughout the application
- **Beautiful UI** - Tailwind CSS with custom styling

## 🎨 Color Customization

To change the brand colors, edit `tailwind.config.js`:

```javascript
colors: {
  brand: {
    red: '#B91C1C',      // Change this
    darkRed: '#7F1D1D',  // Change this
  }
}
```

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🛠️ Technology Stack

- **React** 18.2.0 - UI library
- **React Router DOM** 6.20.0 - Routing
- **Tailwind CSS** 3.3.0 - Styling
- **Recharts** 2.10.0 - Charts
- **Lucide React** 0.263.1 - Icons

## 📝 Notes

- All data is mock data (no backend required)
- Authentication is client-side only
- State is managed with React hooks
- Images and files are represented as placeholders

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm start
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build
rm -rf build
npm run build
```

## 🎯 Next Steps

1. **Backend Integration**
   - Connect to API endpoints
   - Add authentication service
   - Implement real data fetching

2. **Enhanced Features**
   - File upload functionality
   - Export to Excel/PDF
   - Real-time notifications
   - Advanced analytics

3. **Production Deployment**
   - Set environment variables
   - Configure production build
   - Deploy to hosting service

## 📞 Support

For any issues or questions, please refer to the README.md file or React documentation.

---

**Built with ❤️ for Shree Ram Textile**
