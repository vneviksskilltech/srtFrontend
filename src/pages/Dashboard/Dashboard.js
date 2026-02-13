import {
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  BarChart3,
  XCircle,
  Package
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Work Orders",
      value: "104",
      change: "9%",
      trending: "up",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Approvals",
      value: "10",
      change: "5%",
      trending: "up",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "In Production",
      value: "5",
      change: "9%",
      trending: "up",
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "QC Rejected",
      value: "3",
      change: "8%",
      trending: "down",
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Ready for Dispatch",
      value: "26",
      change: "",
      trending: null,
      icon: Package,
      color: "bg-green-100 text-green-600",
    },
  ];

  const orderStatusData = [
    { name: "New", value: 70, color: "#7F1D1D" },
    { name: "In Production", value: 64, color: "#DC2626" },
    { name: "QC Pending", value: 44, color: "#EF4444" },
    { name: "Packaging", value: 27, color: "#F87171" },
    { name: "Dispatched", value: 45, color: "#FCA5A5" },
  ];

  const qcData = [
    { name: "Finish Issue", value: 42, color: "#7F1D1D" },
    { name: "Color Mismatch", value: 18, color: "#DC2626" },
    { name: "Dimension Issue", value: 28, color: "#F87171" },
    { name: "Other", value: 12, color: "#FCA5A5" },
  ];

  const productionData = [
    { name: "Week 1", days: 7 },
    { name: "Week 2", days: 6 },
    { name: "Week 3", days: 5 },
    { name: "Week 4", days: 4 },
    { name: "Week 5", days: 3 },
  ];

  const orders = [
    {
      id: "WO-2024-28",
      company: "Innovate Crop. LTD",
      stage: "At Assembly",
      status: "On time",
      color: "bg-green-100 text-green-600",
    },
    {
      id: "WO-2025-76",
      company: "Techflow Systems",
      stage: "At QC",
      status: "Waiting",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome back, John
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-lg ${stat.color}`}
                >
                  <Icon size={18} />
                </div>
              </div>

              {stat.change && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {stat.trending === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trending === "up" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 bg-white">
          <h3 className="text-xs font-semibold text-gray-700 mb-4">
            ORDER STATUS
          </h3>

          <div className="space-y-4">
            {orderStatusData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom % scale */}
          <div className="flex justify-between text-[10px] text-gray-400 mt-4">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 bg-white">
          <h3 className="text-xs font-semibold text-gray-700 mb-4">
            QC REJECTION REASONS
          </h3>

          <div className="flex items-center justify-between ">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie
                  data={qcData}
                  innerRadius={55}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {qcData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Right Legend */}
            <div className="space-y-3 text-xs">
              {qcData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Production Line */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 bg-white">
          <h3 className="text-xs font-semibold text-gray-700 mb-4">
            PRODUCTION TIME (DAYS)
          </h3>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={productionData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 8]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="days"
                stroke="#B91C1C"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold">Orders</h3>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Stage</th>
              <th className="px-4 py-3 text-left">Status</th>
              {/* <th className="px-4 py-3 text-left">Action</th> */}
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{order.id}</td>
                <td className="px-4 py-3 text-sm">{order.company}</td>
                <td className="px-4 py-3 text-sm">{order.stage}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.color}`}
                  >
                    {order.status}
                  </span>
                </td>
                {/* <td className="px-4 py-3 text-red-500 text-sm cursor-pointer">
                  <button className="text-red-600 hover:text-red-800 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
