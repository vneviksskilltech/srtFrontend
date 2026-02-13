import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import logoutIcon from "../assets/icons/logout.png";
const Sidebar = ({ collapsed, onToggle, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuItems = [
    {
      title: "Main",
      items: [
        {
          icon: "/icon/dashbord.png",
          label: "Dashboard",
          path: "/",
        },
        {
          icon: "/icon/user.png",
          label: "User Management",
          path: "/users",
        },
        {
          icon: "/icon/role.png",
          label: "Role & Permissions",
          path: "/roles",
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          icon: "/icon/sales.png",
          label: "Sales Orders",
          path: "/sales-orders",
        },

        {
          icon: "/icon/work.png",
          label: "Work Orders",
          path: "/work-orders",
        },
        {
          icon: "/icon/role.png",
          label: "Production",
          path: "/production",
        },
        {
          icon: "/icon/qc.png",
          label: "QC",
          path: "/qc",
        },
        {
          icon: "/icon/packaging.png",
          label: "Packaging",
          path: "/packaging",
        },
        {
          icon: "/icon/dispatch.png",
          label: "Dispatch",
          path: "/dispatch",
        },
        { icon: "/icon/dispatch.png", label: "Store", path: "/store" },
      ],
    },
    {
      title: "Post-Sales",
      items: [
        {
          icon: "/icon/feedback.png",
          label: "Customer Feedback",
          path: "/feedback",
        },
      ],
    },

    {
      title: "System",
      items: [
        {
          icon: "/icon/logs.png",
          label: "Activity Logs",
          path: "/activity-logs",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  return (
    <>
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        } flex flex-col fixed left-0 top-0 h-screen z-40`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img src="/logo-small.png" alt="Logo" className="h-8 w-8" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <img
                src="/icon/left.png"
                alt="Collapse"
                className="w-5 h-5 object-contain"
              />
            </button>
          )}
        </div>

        {/* Collapse Button (when collapsed) */}
        {collapsed && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <img
                src="/icon/right.png"
                alt="Expand"
                className="w-5 h-5 object-contain"
              />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <div className="px-6 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}

              {collapsed && idx > 0 && (
                <div className="mx-4 mb-3 border-t border-gray-200"></div>
              )}

              <div className="space-y-1 px-3">
                {section.items.map((item, itemIdx) => {
                  const active = isActive(item.path);

                  return (
                    <button
                      key={itemIdx}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 transition-all duration-200 group relative rounded-lg ${
                        collapsed ? "justify-center px-0 py-3" : "px-4 py-3"
                      } ${
                        active
                          ? "bg-red-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      title={collapsed ? item.label : ""}
                    >
                      {/* Icon */}
                      <div
                        className={`flex items-center justify-center ${collapsed ? "w-5 h-5" : "w-5 h-5"}`}
                      >
                        <img
                          src={item.icon}
                          alt={item.label}
                          className={`w-full h-full object-contain transition-all duration-200 ${
                            active
                              ? "brightness-0 invert"
                              : "opacity-70 group-hover:opacity-100"
                          }`}
                        />
                      </div>

                      {/* Label */}
                      {!collapsed && (
                        <span
                          className={`text-sm font-medium ${
                            active ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 group ${
              collapsed ? "justify-center px-0 py-3" : "px-4 py-3"
            } text-gray-700 hover:bg-red-50 hover:text-red-600 relative`}
            title={collapsed ? "Logout" : ""}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <img
                src="/icon/logout.png"
                alt="Logout"
                className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </div>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </button>
        </div>
      </aside>
      <ConfirmModal
        icon={logoutIcon}
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout Account"
        message="Are you sure you want to logout from your account?"
        confirmText="Yes, Logout"
        cancelText="No, Stay"
      />
    </>
  );
};

export default Sidebar;
