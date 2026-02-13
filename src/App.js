import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserManagement from "./pages/UserManagement/UserManagement";
import RolePermissions from "./pages/UserManagement/RolePermissions";
import QCMonitoring from "./pages/QC/QCMonitoring";
import Layout from "./components/Layout";
import ActivityLogs from "./pages/ActivityLogs/ActivityLogs";
import CustomerFeedback from "./pages/CustomerFeedback/CustomerFeedback";
import Dispatch from "./pages/Dispatch/Dispatch";
import {
  AddEditSalesOrder,
  SalesOrderDetails,
  SalesOrders,
} from "./pages/SalesOrders/SalesOrders";
import AddEditWorkOrder from "./pages/WorkOrders/AddEditWorkOrder";
import WorkOrders from "./pages/WorkOrders/WorkOrders";
import Packaging from "./pages/Packaging/Packaging";
import AddEditPackaging from "./pages/Packaging/AddEditPackaging";
import WorkOrderView from "./pages/WorkOrders/WorkOrderView";
import ProductionManagement from "./pages/Production/Production";
import StoreManagement from "./pages/Store/Store";
function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    localStorage.getItem("isAuthenticated") === "true",
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/roles" element={<RolePermissions />} />
                  <Route path="/sales-orders" element={<SalesOrders />} />
                  <Route
                    path="/sales-orders/add"
                    element={<AddEditSalesOrder />}
                  />
                  <Route
                    path="/sales-orders/edit/:id"
                    element={<AddEditSalesOrder mode="edit" />}
                  />
                  <Route
                    path="/sales-orders/:id"
                    element={<SalesOrderDetails />}
                  />
                  <Route path="/" element={<SalesOrders />} />
                  <Route
                    path="/production"
                    element={<ProductionManagement />}
                  />
                  <Route path="/qc" element={<QCMonitoring />} />
                  <Route path="/" element={<Navigate to="/" />} />
                  <Route path="/activity-logs" element={<ActivityLogs />} />
                  <Route path="/feedback" element={<CustomerFeedback />} />
                  <Route path="/dispatch" element={<Dispatch />} />
                  <Route path="/work-orders" element={<WorkOrders />} />
                  <Route
                    path="/work-orders/add"
                    element={<AddEditWorkOrder mode="add" />}
                  />
                  <Route
                    path="/work-orders/edit/:wo"
                    element={<AddEditWorkOrder mode="edit" />}
                  />
                  <Route
                    path="/work-orders/view/:wo"
                    element={<WorkOrderView />}
                  />
                  <Route path="/packaging" element={<Packaging />} />
                  <Route
                    path="/packaging/add"
                    element={<AddEditPackaging mode="add" />}
                  />
                  <Route
                    path="/packaging/edit/:id"
                    element={<AddEditPackaging mode="edit" />}
                  />
                   <Route path="/store" element={<StoreManagement />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
