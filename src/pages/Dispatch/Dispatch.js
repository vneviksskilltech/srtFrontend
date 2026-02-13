import { useState, useEffect } from "react";
import {
  Search,
  Truck,
  FileText,
  CheckCircle,
  XCircle,
  Printer,
  Package,
} from "lucide-react";

const Dispatch = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dispatchData, setDispatchData] = useState([]);
  const [packagingData, setPackagingData] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    soNumber: "",
    woNumber: "",
    packagingId: "",
    clientName: "",
    clientAddress: "",
    contactPerson: "",
    contactPhone: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    dispatchTime: new Date().toLocaleTimeString(),
    gatePassId: "",
    lrNumber: "",
    transporter: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    shippedQuantity: 0,
    totalQuantity: 0,
    paymentStatus: "",
    paymentTerms: "",
    status: "Ready to Dispatch",
    trackingUrl: "",
    remarks: "",
    dispatchedBy: "",
    expectedDeliveryDate: "",
    createdAt: new Date().toISOString(),
  });

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load dispatch records
    const storedDispatch =
      JSON.parse(localStorage.getItem("dispatchRecords")) || [];

    // Load completed packaging records
    const storedPackaging =
      JSON.parse(localStorage.getItem("packagingRecords")) || [];
    const completedPackaging = storedPackaging.filter(
      (p) => p.status === "Completed" && p.isCompleted === true,
    );

    // Load sales orders for payment and address info
    const storedSOs = JSON.parse(localStorage.getItem("salesOrders")) || [];

    // Transform dispatch records to ensure consistent format
    const formattedDispatch = storedDispatch.map((record) => ({
      ...record,
      dispatchDate:
        record.dispatchDate ||
        record.createdAt?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      dispatchTime: record.dispatchTime || "",
      status: record.status || "Ready to Dispatch",
    }));

    // Sort by most recent first
    const sortedDispatch = formattedDispatch.sort(
      (a, b) => new Date(b.dispatchDate || 0) - new Date(a.dispatchDate || 0),
    );

    setDispatchData(sortedDispatch);
    setPackagingData(completedPackaging);
    setSalesOrders(storedSOs);
  };

  // Auto-generate Gate Pass ID
  const generateGatePassId = () => {
    const prefix = "GP";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}-${year}${month}-${random}`;
  };

  // Auto-generate LR Number
  const generateLRNumber = (transporter) => {
    const prefix = transporter
      ? transporter.substring(0, 3).toUpperCase()
      : "LR";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    return `${prefix}${year}${month}${random}`;
  };

  // Handle select packaged product
  const handleSelectPackagedProduct = (packagingId) => {
    const packaging = packagingData.find((p) => p.id === packagingId);
    if (!packaging) return;

    // Get sales order details
    const so = salesOrders.find((s) => s.id === packaging.soNumber);

    // Auto-generate Gate Pass and LR
    const gatePassId = generateGatePassId();
    const lrNumber = generateLRNumber("VRL"); // Default transporter

    setSelectedPackaging(packaging);
    setFormData({
      ...formData,
      id: `DSP-${Date.now().toString().slice(-6)}`,
      soNumber: packaging.soNumber || "",
      woNumber: packaging.woNumber || "",
      packagingId: packaging.id,
      clientName: packaging.clientName || "",
      clientAddress: so?.shippingAddress || "",
      contactPerson: so?.contactPerson || "",
      contactPhone: so?.phone || "",
      dispatchDate: new Date().toISOString().split("T")[0],
      dispatchTime: new Date().toLocaleTimeString(),
      gatePassId: gatePassId,
      lrNumber: lrNumber,
      shippedQuantity: packaging.packedQty || 0,
      totalQuantity: packaging.packedQty || 0,
      paymentStatus: so?.paymentStatus || "Pending",
      paymentTerms: so?.paymentTerms || "",
      status: "Ready to Dispatch",
      expectedDeliveryDate: calculateExpectedDelivery(so?.deliveryDate),
      createdAt: new Date().toISOString(),
    });

    setShowDispatchForm(true);
  };

  // Calculate expected delivery date
  const calculateExpectedDelivery = (deliveryDate) => {
    if (deliveryDate) return deliveryDate;
    const date = new Date();
    date.setDate(date.getDate() + 3); // Default 3 days transit
    return date.toISOString().split("T")[0];
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate LR number if transporter is selected
    if (name === "transporter" && value && !formData.lrNumber) {
      const lrNumber = generateLRNumber(value);
      setFormData((prev) => ({ ...prev, lrNumber }));
    }
  };

  // Regenerate LR Number
  const handleRegenerateLR = () => {
    const lrNumber = generateLRNumber(formData.transporter || "LR");
    setFormData((prev) => ({ ...prev, lrNumber }));
  };

  // Regenerate Gate Pass
  const handleRegenerateGatePass = () => {
    const gatePassId = generateGatePassId();
    setFormData((prev) => ({ ...prev, gatePassId }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.transporter.trim()) {
      alert("Please enter transporter details");
      return false;
    }
    if (!formData.vehicleNumber.trim()) {
      alert("Please enter vehicle number");
      return false;
    }
    if (!formData.driverName.trim()) {
      alert("Please enter driver name");
      return false;
    }
    if (!formData.dispatchedBy.trim()) {
      alert("Please enter dispatcher name");
      return false;
    }
    if (!formData.shippedQuantity || formData.shippedQuantity <= 0) {
      alert("Please enter valid shipped quantity");
      return false;
    }
    return true;
  };

  // Confirm Dispatch
  const handleConfirmDispatch = () => {
    if (!validateForm()) return;

    const now = new Date();
    const dispatchRecord = {
      ...formData,
      status: "In Transit",
      dispatchDate: now.toISOString().split("T")[0],
      dispatchTime: now.toLocaleTimeString(),
      dispatchedAt: now.toISOString(),
    };

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem("dispatchRecords")) || [];
    const updated = [...stored, dispatchRecord];
    localStorage.setItem("dispatchRecords", JSON.stringify(updated));

    // Update packaging record to mark as dispatched
    if (formData.packagingId) {
      const allPackaging =
        JSON.parse(localStorage.getItem("packagingRecords")) || [];
      const updatedPackaging = allPackaging.map((p) => {
        if (p.id === formData.packagingId) {
          return {
            ...p,
            status: "Dispatched",
            dispatchId: dispatchRecord.id,
            dispatchedAt: now.toISOString(),
          };
        }
        return p;
      });
      localStorage.setItem(
        "packagingRecords",
        JSON.stringify(updatedPackaging),
      );
    }

    // Update work order status
    if (formData.woNumber) {
      const allWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
      const updatedWOs = allWOs.map((wo) => {
        if (wo.id === formData.woNumber) {
          return {
            ...wo,
            status: "Dispatched",
            dispatchId: dispatchRecord.id,
            dispatchedAt: now.toISOString(),
          };
        }
        return wo;
      });
      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
    }

    // Send notification to customer (simulated)
    sendDispatchNotification(dispatchRecord);

    setShowDispatchForm(false);
    setSelectedPackaging(null);
    loadData(); // Reload data

    alert(
      `✅ Dispatch confirmed!\nGate Pass: ${dispatchRecord.gatePassId}\nLR Number: ${dispatchRecord.lrNumber}`,
    );
  };

  // Send dispatch notification (simulated)
  const sendDispatchNotification = (dispatch) => {
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    const newNotification = {
      id: `NOTIF-${Date.now()}`,
      type: "dispatch_confirmed",
      title: "Product Dispatched",
      message: `Shipment for ${dispatch.clientName} has been dispatched. LR: ${dispatch.lrNumber}`,
      recipient: "Customer",
      read: false,
      createdAt: new Date().toISOString(),
      data: { dispatchId: dispatch.id, lrNumber: dispatch.lrNumber },
    };
    localStorage.setItem(
      "notifications",
      JSON.stringify([...notifications, newNotification]),
    );
  };

  // Update dispatch status
  const handleUpdateStatus = (id, newStatus) => {
    const stored = JSON.parse(localStorage.getItem("dispatchRecords")) || [];
    const updated = stored.map((record) => {
      if (record.id === id) {
        return {
          ...record,
          status: newStatus,
          ...(newStatus === "Delivered" && {
            deliveredAt: new Date().toISOString(),
            deliveredDate: new Date().toISOString().split("T")[0],
          }),
        };
      }
      return record;
    });

    localStorage.setItem("dispatchRecords", JSON.stringify(updated));
    setDispatchData(updated);

    if (newStatus === "Delivered") {
      alert("✅ Shipment marked as Delivered");
    }
  };

  // Print Gate Pass
  const handlePrintGatePass = (dispatch) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Gate Pass - ${dispatch.gatePassId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .gate-pass { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .company { font-size: 18px; color: #7F1D1D; }
            .row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 150px; }
            .value { flex: 1; }
            .footer { margin-top: 30px; border-top: 1px solid #000; padding-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="gate-pass">
            <div class="header">
              <div class="title">GATE PASS</div>
              <div>${dispatch.gatePassId}</div>
            </div>
            <div class="row">
              <div class="label">Date:</div>
              <div class="value">${dispatch.dispatchDate} ${dispatch.dispatchTime}</div>
            </div>
            <div class="row">
              <div class="label">Client:</div>
              <div class="value">${dispatch.clientName}</div>
            </div>
            <div class="row">
              <div class="label">SO Number:</div>
              <div class="value">${dispatch.soNumber}</div>
            </div>
            <div class="row">
              <div class="label">WO Number:</div>
              <div class="value">${dispatch.woNumber}</div>
            </div>
            <div class="row">
              <div class="label">Transporter:</div>
              <div class="value">${dispatch.transporter}</div>
            </div>
            <div class="row">
              <div class="label">Vehicle No:</div>
              <div class="value">${dispatch.vehicleNumber}</div>
            </div>
            <div class="row">
              <div class="label">Driver:</div>
              <div class="value">${dispatch.driverName} (${dispatch.driverPhone})</div>
            </div>
            <div class="row">
              <div class="label">LR Number:</div>
              <div class="value">${dispatch.lrNumber}</div>
            </div>
            <div class="row">
              <div class="label">Quantity:</div>
              <div class="value">${dispatch.shippedQuantity} units</div>
            </div>
            <div class="footer">
              Authorized Signature: ____________________
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Gate Pass</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter data
  const filteredData = dispatchData.filter((item) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      (item.clientName || "").toLowerCase().includes(searchTerm) ||
      (item.soNumber || "").toLowerCase().includes(searchTerm) ||
      (item.woNumber || "").toLowerCase().includes(searchTerm) ||
      (item.lrNumber || "").toLowerCase().includes(searchTerm) ||
      (item.gatePassId || "").toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter === "" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      "Ready to Dispatch": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
      Delivered: "bg-green-100 text-green-700 border-green-200",
      Dispatched: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Get payment color
  const getPaymentColor = (status) => {
    const colors = {
      "Advance Paid": "bg-green-100 text-green-700",
      Paid: "bg-green-100 text-green-700",
      Pending: "bg-red-100 text-red-700",
      Partial: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dispatch</h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-generate Gate Pass & LR Number • Track shipments • Manage
            deliveries
          </p>
        </div>

        <div className="flex gap-3">
          {packagingData.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => handleSelectPackagedProduct(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Packaged Product
                </option>
                {packagingData.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.woNumber} - {p.clientName} (Qty: {p.packedQty})
                  </option>
                ))}
              </select>
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {packagingData.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready to Dispatch</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  dispatchData.filter((d) => d.status === "Ready to Dispatch")
                    .length
                }
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">
                {dispatchData.filter((d) => d.status === "In Transit").length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {dispatchData.filter((d) => d.status === "Delivered").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Dispatch</p>
              <p className="text-2xl font-bold text-gray-700">
                {dispatchData.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Client, SO/WO No, LR, Gate Pass"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option>Ready to Dispatch</option>
            <option>In Transit</option>
            <option>Delivered</option>
          </select>
        </div>
      </div>

      {/* Dispatch Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Dispatch ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Gate Pass
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Client / SO
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Transporter
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  LR Number
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Dispatch Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Payment
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">
                          {item.gatePassId}
                        </span>
                        <button
                          onClick={() => handlePrintGatePass(item)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Print Gate Pass"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{item.clientName}</div>
                        <div className="text-xs text-gray-500">
                          SO: {item.soNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          WO: {item.woNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-xs font-medium">
                          {item.transporter}
                        </div>
                        {item.vehicleNumber && (
                          <div className="text-xs text-gray-500">
                            {item.vehicleNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">
                          {item.lrNumber}
                        </span>
                        <a
                          href={item.trackingUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Track Shipment"
                        >
                          <Truck className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div>{item.dispatchDate}</div>
                        {item.dispatchTime && (
                          <div className="text-gray-500">
                            {item.dispatchTime}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                        {item.status === "In Transit" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, "Delivered")
                            }
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(item.paymentStatus)}`}
                      >
                        {item.paymentStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintGatePass(item)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="Print Gate Pass"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {/* <button
                          onClick={() => window.open(`/dispatch/view/${item.id}`, '_blank')}
                          className="p-1 hover:bg-gray-50 rounded text-gray-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg">No dispatch records found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {search || statusFilter
                          ? "Try adjusting your filters"
                          : "Select a packaged product to create dispatch"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Form Modal */}
      {showDispatchForm && selectedPackaging && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Confirm Dispatch
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generating Gate Pass & LR Number
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDispatchForm(false);
                  setSelectedPackaging(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Auto-generated IDs */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Auto-generated Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Gate Pass ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="gatePassId"
                        value={formData.gatePassId}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={handleRegenerateGatePass}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      LR Number
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="lrNumber"
                        value={formData.lrNumber}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={handleRegenerateLR}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    WO Number
                  </label>
                  <input
                    type="text"
                    value={formData.woNumber}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    SO Number
                  </label>
                  <input
                    type="text"
                    value={formData.soNumber}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Client Address */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Shipping Address
                </label>
                <textarea
                  name="clientAddress"
                  rows="2"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Transport Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Transport Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Transporter Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transporter"
                      value={formData.transporter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., VRL Logistics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., MH12AB1234"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Enter driver name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Driver Phone
                    </label>
                    <input
                      type="text"
                      name="driverPhone"
                      value={formData.driverPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Enter driver phone"
                    />
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Shipped Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="shippedQuantity"
                    value={formData.shippedQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Dispatched By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dispatchedBy"
                    value={formData.dispatchedBy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              {/* Tracking URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  name="trackingUrl"
                  value={formData.trackingUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="https://tracking.example.com/123456"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Dispatch Remarks
                </label>
                <textarea
                  name="remarks"
                  rows="2"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Any special instructions or remarks..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDispatchForm(false);
                  setSelectedPackaging(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
