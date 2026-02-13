import { useState, useRef, useEffect } from "react";

const Header = ({ userName = "Admin" }) => {
  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "📦 Packaging Completed - PK-301" },
    { id: 2, text: "🚚 Dispatch Delivered - DSP-402" },
    { id: 3, text: "⭐ New Customer Feedback Received" },
  ]);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }

      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Left */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome back, <span className="text-red-600">{userName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
            />
          </div>

          {/* Notification */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg relative hover:bg-gray-50"
            >
              <img
                src="/icon/bell.png"
                alt="Notifications"
                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
              />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-lg border z-50">
                <div className="flex justify-between items-center p-4 border-b">
                  <span className="font-semibold">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 text-sm hover:bg-gray-50 border-b last:border-none"
                      >
                        {n.text}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <img
                src="/icon/user-he.png"
                alt="User Profile"
                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border z-50">
                <div
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowUserMenu(false);
                  }}
                  className="p-3 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  My Profile
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold mb-4">My Profile</h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Name:</span> Admin
              </div>
              <div>
                <span className="font-medium">Email:</span> admin@company.com
              </div>
              <div>
                <span className="font-medium">Mobile:</span> +91 9876543210
              </div>
              <div>
                <span className="font-medium">Role:</span> Admin
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
