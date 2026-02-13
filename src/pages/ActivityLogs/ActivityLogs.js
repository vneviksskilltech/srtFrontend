import { useState } from "react";
import { Search, Calendar } from "lucide-react";

const ActivityLogs = () => {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  const logs = [
    {
      id: 1,
      user: "Rohan Mehta",
      role: "Sales",
      module: "Sales Orders",
      action: "Created Sales Order SO-2047",
      status: "Success",
      date: "07 Feb 2026",
      time: "09:15 AM",
    },
    {
      id: 2,
      user: "Amit Kulkarni",
      role: "Production",
      module: "Work Orders",
      action: "Updated WO-105 status to In Production",
      status: "Success",
      date: "07 Feb 2026",
      time: "10:30 AM",
    },
    {
      id: 3,
      user: "Sneha Patil",
      role: "QC",
      module: "QC Monitoring",
      action: "Rejected WO-102 (Color mismatch)",
      status: "Warning",
      date: "07 Feb 2026",
      time: "11:05 AM",
    },
    {
      id: 4,
      user: "Admin User",
      role: "Admin",
      module: "User Management",
      action: "Deleted user test@example.com",
      status: "Critical",
      date: "06 Feb 2026",
      time: "04:40 PM",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    return (
      log.user.toLowerCase().includes(search.toLowerCase()) &&
      (moduleFilter === "" || log.module === moduleFilter)
    );
  });

  const getStatusColor = (status) => {
    const colors = {
      Success: "bg-green-100 text-green-700",
      Warning: "bg-yellow-100 text-yellow-700",
      Critical: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track system activity across all modules
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full focus:ring-2 focus:ring-[#7F1D1D]"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#7F1D1D]"
          >
            <option value="">All Modules</option>
            <option>Sales Orders</option>
            <option>Work Orders</option>
            <option>QC Monitoring</option>
            <option>User Management</option>
          </select>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Date range"
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full focus:ring-2 focus:ring-[#7F1D1D]"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">View</th> */}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{log.user}</td>
                  <td className="px-6 py-4 text-sm">{log.role}</td>
                  <td className="px-6 py-4 text-sm">{log.module}</td>
                  <td className="px-6 py-4 text-sm">{log.action}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{log.date}</td>
                  <td className="px-6 py-4 text-sm">{log.time}</td>
                  {/* <td className="px-6 py-4 text-sm">
                    <button className="text-gray-600 hover:text-black">
                      <Eye size={18} />
                    </button>
                  </td> */}
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
