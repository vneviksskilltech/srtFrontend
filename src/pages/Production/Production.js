import { useState, useEffect } from "react";
import {
  Play,
  CheckCircle,
  XCircle, FileText,
  Package,
  Users, Clock,
  Settings,
  Wrench, ClipboardCheck, Search
} from "lucide-react";

const ProductionManagement = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [productionRecords, setProductionRecords] = useState([]);
  const [storeStock, setStoreStock] = useState([]);
  const [viewMode, setViewMode] = useState("pending"); // pending, approved, in_production, completed
  const [search, setSearch] = useState("");
  const [showProductionStart, setShowProductionStart] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [productionForm, setProductionForm] = useState({
    woId: "",
    soNumber: "",
    clientName: "",
    teamLeader: "",
    operators: [],
    startDate: new Date().toISOString().split("T")[0],
    startTime: new Date().toLocaleTimeString(),
    techCheck: false,
    bomCheck: false,
    materialCheck: false,
    materialStatus: "pending",
    materialRequirements: [],
    insufficientMaterials: [],
    qcParameters: [
      {
        id: 1,
        name: "Harry",
        status: "pending",
        checkedBy: "",
        checkedAt: null,
        remarks: "",
      },
      {
        id: 2,
        name: "Machinery",
        status: "pending",
        checkedBy: "",
        checkedAt: null,
        remarks: "",
      },
      {
        id: 3,
        name: "Color",
        status: "pending",
        checkedBy: "",
        checkedAt: null,
        remarks: "",
      },
      {
        id: 4,
        name: "Assembly",
        status: "pending",
        checkedBy: "",
        checkedAt: null,
        remarks: "",
      },
    ],
    productionStarted: false,
    productionCompleted: false,
    startedAt: null,
    completedAt: null,
    totalOperations: 0,
    completedOperations: 0,
    remarks: "",
  });

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load work orders
    const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];

    // Load production records
    const storedProduction =
      JSON.parse(localStorage.getItem("productionRecords")) || [];

    // Load store stock
    const storedStock = JSON.parse(localStorage.getItem("storeStock")) || [];

    // Transform work orders to include approval status if not present
    const updatedWOs = storedWOs.map((wo) => ({
      ...wo,
      approvalStatus: wo.approvalStatus || "pending",
      approvalRemarks: wo.approvalRemarks || "",
      approvedAt: wo.approvedAt || null,
      approvedBy: wo.approvedBy || null,
      productionStatus: wo.productionStatus || "pending",
    }));

    setWorkOrders(updatedWOs);
    setProductionRecords(storedProduction);
    setStoreStock(storedStock);
  };

  // Admin Approval Functions
  const handleApproveWO = (woId) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo) return;

    // Check material availability
    const materialCheck = checkMaterialAvailability(wo);

    if (!materialCheck.allAvailable) {
      alert(
        `⚠️ Cannot approve: Insufficient stock for materials:\n${materialCheck.missingMaterials.join("\n")}`,
      );
      return;
    }

    if (window.confirm(`Approve Work Order ${woId}?`)) {
      const updatedWOs = workOrders.map((wo) => {
        if (wo.id === woId) {
          return {
            ...wo,
            approvalStatus: "approved",
            approvedAt: new Date().toISOString(),
            approvedBy: "Admin", // In real app, get from auth context
            productionStatus: "ready",
            status: "Approved",
          };
        }
        return wo;
      });

      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
      setWorkOrders(updatedWOs);

      // Send notification to Production Incharge
      sendNotification({
        type: "wo_approved",
        title: "Work Order Approved",
        message: `WO ${woId} has been approved and is ready for production`,
        recipient: "production",
        woId: woId,
      });

      alert("✅ Work Order approved and sent to Production");
    }
  };

  const handleRejectWO = (woId) => {
    const remarks = prompt("Please enter rejection remarks:");
    if (remarks === null) return;

    if (!remarks.trim()) {
      alert("Rejection remarks are required");
      return;
    }

    const updatedWOs = workOrders.map((wo) => {
      if (wo.id === woId) {
        return {
          ...wo,
          approvalStatus: "rejected",
          approvalRemarks: remarks,
          rejectedAt: new Date().toISOString(),
          rejectedBy: "Admin",
          status: "Rejected",
        };
      }
      return wo;
    });

    localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
    setWorkOrders(updatedWOs);

    // Send notification back to Sales
    sendNotification({
      type: "wo_rejected",
      title: "Work Order Rejected",
      message: `WO ${woId} has been rejected. Remarks: ${remarks}`,
      recipient: "sales",
      woId: woId,
    });

    alert("❌ Work Order rejected");
  };

  // Check material availability against store stock
  const checkMaterialAvailability = (workOrder) => {
    const requirements = workOrder.materialRequirements || [];
    const missingMaterials = [];
    let allAvailable = true;

    requirements.forEach((req) => {
      const stockItem = storeStock.find((s) => s.material === req.material);
      const available = stockItem && stockItem.currentStock >= req.requiredQty;

      if (!available) {
        allAvailable = false;
        missingMaterials.push(
          `${req.material}: Required ${req.requiredQty}, Available: ${stockItem?.currentStock || 0}`,
        );
      }
    });

    return { allAvailable, missingMaterials };
  };

  // Start Production
  const handleStartProduction = (wo) => {
    // Check if all pre-requisites are met
    if (wo.approvalStatus !== "approved") {
      alert("Work Order must be approved by Admin first");
      return;
    }

    const materialCheck = checkMaterialAvailability(wo);
    if (!materialCheck.allAvailable) {
      alert("Cannot start production: Insufficient materials");
      return;
    }

    setSelectedWO(wo);
    setProductionForm({
      ...productionForm,
      woId: wo.id,
      soNumber: wo.soNumber || "",
      clientName: wo.clientName || "",
      materialRequirements: wo.materialRequirements || [],
      insufficientMaterials: materialCheck.missingMaterials,
      startDate: new Date().toISOString().split("T")[0],
      startTime: new Date().toLocaleTimeString(),
      techCheck: false,
      bomCheck: false,
      materialCheck: materialCheck.allAvailable,
      materialStatus: materialCheck.allAvailable ? "available" : "insufficient",
    });

    setShowProductionStart(true);
  };

  // Confirm Production Start
  const handleConfirmProductionStart = () => {
    if (!productionForm.teamLeader.trim()) {
      alert("Please enter Team Leader name");
      return;
    }

    if (!productionForm.techCheck) {
      alert("Please complete Tech Check");
      return;
    }

    if (!productionForm.bomCheck) {
      alert("Please complete BOM Check");
      return;
    }

    const now = new Date();
    const productionRecord = {
      id: `PROD-${Date.now()}`,
      woId: productionForm.woId,
      soNumber: productionForm.soNumber,
      clientName: productionForm.clientName,
      teamLeader: productionForm.teamLeader,
      operators: productionForm.operators,
      startDate: productionForm.startDate,
      startTime: productionForm.startTime,
      startedAt: now.toISOString(),
      techCheck: {
        status: true,
        checkedAt: now.toISOString(),
        checkedBy: productionForm.teamLeader,
      },
      bomCheck: {
        status: true,
        checkedAt: now.toISOString(),
        checkedBy: productionForm.teamLeader,
      },
      materialCheck: {
        status: productionForm.materialCheck,
        checkedAt: now.toISOString(),
        checkedBy: productionForm.teamLeader,
        insufficientMaterials: productionForm.insufficientMaterials,
      },
      qcParameters: productionForm.qcParameters,
      productionStarted: true,
      productionCompleted: false,
      status: "In Production",
      remarks: productionForm.remarks,
    };

    // Update work order status
    const updatedWOs = workOrders.map((wo) => {
      if (wo.id === productionForm.woId) {
        return {
          ...wo,
          productionStatus: "in_progress",
          status: "In Production",
          productionStartedAt: now.toISOString(),
          productionTeam: productionForm.teamLeader,
          productionId: productionRecord.id,
        };
      }
      return wo;
    });

    // Save production record
    const updatedProduction = [...productionRecords, productionRecord];

    localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
    localStorage.setItem(
      "productionRecords",
      JSON.stringify(updatedProduction),
    );

    setWorkOrders(updatedWOs);
    setProductionRecords(updatedProduction);
    setShowProductionStart(false);
    setSelectedWO(null);

    // Send notifications
    sendNotification({
      type: "production_started",
      title: "Production Started",
      message: `Production started for WO ${productionForm.woId}`,
      recipient: "admin,sales",
      woId: productionForm.woId,
      productionId: productionRecord.id,
    });

    alert("✅ Production started successfully!");
  };

  // Update QC Parameter Status
  const handleQCUpdate = (productionId, parameterId, status, remarks = "") => {
    const updatedProduction = productionRecords.map((prod) => {
      if (prod.id === productionId) {
        const updatedParams = prod.qcParameters.map((param) => {
          if (param.id === parameterId) {
            return {
              ...param,
              status: status,
              checkedBy: prod.teamLeader,
              checkedAt: new Date().toISOString(),
              remarks: remarks,
            };
          }
          return param;
        });

        // Calculate completed operations
        const completedCount = updatedParams.filter(
          (p) => p.status === "approved" || p.status === "rejected",
        ).length;

        return {
          ...prod,
          qcParameters: updatedParams,
          completedOperations: completedCount,
          totalOperations: updatedParams.length,
        };
      }
      return prod;
    });

    localStorage.setItem(
      "productionRecords",
      JSON.stringify(updatedProduction),
    );
    setProductionRecords(updatedProduction);
  };

  // Complete Production
  const handleCompleteProduction = (productionId) => {
    const production = productionRecords.find((p) => p.id === productionId);

    // Check if all QC parameters are completed
    const allQCDone = production.qcParameters.every(
      (p) => p.status !== "pending",
    );
    if (!allQCDone) {
      alert("Please complete all QC checks before completing production");
      return;
    }

    const anyRejected = production.qcParameters.some(
      (p) => p.status === "rejected",
    );

    const now = new Date();
    const updatedProduction = productionRecords.map((prod) => {
      if (prod.id === productionId) {
        return {
          ...prod,
          productionCompleted: true,
          completedAt: now.toISOString(),
          completeDate: now.toISOString().split("T")[0],
          completeTime: now.toLocaleTimeString(),
          status: anyRejected ? "QC Failed" : "Completed",
          finalStatus: anyRejected ? "rejected" : "approved",
        };
      }
      return prod;
    });

    // Update work order status
    const updatedWOs = workOrders.map((wo) => {
      if (wo.id === production.woId) {
        return {
          ...wo,
          productionStatus: anyRejected ? "failed" : "completed",
          status: anyRejected ? "QC Rejected" : "Completed",
          completedAt: now.toISOString(),
          qcStatus: anyRejected ? "rejected" : "approved",
        };
      }
      return wo;
    });

    localStorage.setItem(
      "productionRecords",
      JSON.stringify(updatedProduction),
    );
    localStorage.setItem("workOrders", JSON.stringify(updatedWOs));

    setProductionRecords(updatedProduction);
    setWorkOrders(updatedWOs);

    // Send notifications
    sendNotification({
      type: anyRejected ? "production_failed" : "production_completed",
      title: anyRejected ? "Production Failed QC" : "Production Completed",
      message: anyRejected
        ? `Production for WO ${production.woId} failed QC checks`
        : `Production completed for WO ${production.woId}`,
      recipient: "admin,sales,qc",
      woId: production.woId,
      productionId: production.id,
    });

    if (anyRejected) {
      alert("❌ Production completed with QC failures. Sent to QC for review.");
    } else {
      alert(
        "✅ Production completed successfully! Sent to QC for final approval.",
      );
    }
  };

  // Send notification
  const sendNotification = (notification) => {
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    const newNotification = {
      id: `NOTIF-${Date.now()}`,
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "notifications",
      JSON.stringify([...notifications, newNotification]),
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      ready: "bg-blue-100 text-blue-700 border-blue-200",
      "In Production": "bg-purple-100 text-purple-700 border-purple-200",
      Completed: "bg-green-100 text-green-700 border-green-200",
      "QC Failed": "bg-red-100 text-red-700 border-red-200",
      "QC Rejected": "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Filter work orders based on view mode
  const filteredWOs = workOrders.filter((wo) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      (wo.id || "").toLowerCase().includes(searchTerm) ||
      (wo.soNumber || "").toLowerCase().includes(searchTerm) ||
      (wo.clientName || "").toLowerCase().includes(searchTerm);

    if (viewMode === "pending") {
      return wo.approvalStatus === "pending" && matchesSearch;
    } else if (viewMode === "approved") {
      return (
        wo.approvalStatus === "approved" &&
        wo.productionStatus === "ready" &&
        matchesSearch
      );
    } else if (viewMode === "in_production") {
      return wo.productionStatus === "in_progress" && matchesSearch;
    } else if (viewMode === "completed") {
      return wo.productionStatus === "completed" && matchesSearch;
    }

    return matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Production Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Admin Approval → Tech Check → BOM Check → Material Check →
            Production → QC
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6 inline-flex">
        <button
          onClick={() => setViewMode("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "pending"
              ? "bg-yellow-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setViewMode("approved")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "approved"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Ready for Production
        </button>
        <button
          onClick={() => setViewMode("in_production")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "in_production"
              ? "bg-purple-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          In Production
        </button>
        <button
          onClick={() => setViewMode("completed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "completed"
              ? "bg-green-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by WO, SO, or Client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-96 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  WO / SO
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Client
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Material Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Admin Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Production Status
                </th>
                {/* <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWOs.length > 0 ? (
                filteredWOs.map((wo) => {
                  const materialCheck = checkMaterialAvailability(wo);

                  return (
                    <tr
                      key={wo.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {wo.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            SO: {wo.soNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{wo.clientName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {materialCheck.allAvailable ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✓ Available
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              ⚠ Insufficient
                            </span>
                            <span className="text-xs text-red-600">
                              {materialCheck.missingMaterials.length} items low
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(wo.approvalStatus)}`}
                        >
                          {wo.approvalStatus === "pending"
                            ? "Pending"
                            : wo.approvalStatus === "approved"
                              ? "Approved"
                              : "Rejected"}
                        </span>
                        {wo.approvalRemarks && (
                          <div
                            className="text-xs text-gray-500 mt-1"
                            title={wo.approvalRemarks}
                          >
                            {wo.approvalRemarks.substring(0, 20)}...
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(wo.status)}`}
                        >
                          {wo.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Admin Actions */}
                          {wo.approvalStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveWO(wo.id)}
                                disabled={!materialCheck.allAvailable}
                                className={`p-1 rounded ${
                                  materialCheck.allAvailable
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  materialCheck.allAvailable
                                    ? "Approve"
                                    : "Cannot approve - insufficient materials"
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectWO(wo.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Production Actions */}
                          {wo.approvalStatus === "approved" &&
                            wo.productionStatus === "ready" && (
                              <button
                                onClick={() => handleStartProduction(wo)}
                                disabled={!materialCheck.allAvailable}
                                className={`p-1 rounded flex items-center gap-1 ${
                                  materialCheck.allAvailable
                                    ? "text-blue-600 hover:bg-blue-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title="Start Production"
                              >
                                <Play className="w-4 h-4" />
                                <span className="text-xs">Start</span>
                              </button>
                            )}

                          {/* View Details */}
                          {/* <button
                            onClick={() => navigate(`/production/view/${wo.id}`)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg">No work orders found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {viewMode === "pending"
                          ? "No pending approvals"
                          : viewMode === "approved"
                            ? "No approved work orders ready for production"
                            : viewMode === "in_production"
                              ? "No active production"
                              : "No completed production"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Production Section */}
      {productionRecords.filter(
        (p) => p.productionStarted && !p.productionCompleted,
      ).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Active Production
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {productionRecords
              .filter((p) => p.productionStarted && !p.productionCompleted)
              .map((production) => (
                <div
                  key={production.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        WO: {production.woId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {production.clientName}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      In Production
                    </span>
                  </div>

                  {/* Team Info */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Team Leader:</span>
                      <span>{production.teamLeader}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Started:</span>
                      <span>
                        {new Date(production.startedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Pre-production Checks */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div
                      className={`p-2 rounded-lg text-center ${
                        production.techCheck?.status
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Wrench
                        className={`w-4 h-4 mx-auto mb-1 ${
                          production.techCheck?.status
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="text-xs font-medium">Tech Check</span>
                      {production.techCheck?.status && (
                        <span className="block text-xs text-green-600">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-lg text-center ${
                        production.bomCheck?.status
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <FileText
                        className={`w-4 h-4 mx-auto mb-1 ${
                          production.bomCheck?.status
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="text-xs font-medium">BOM Check</span>
                      {production.bomCheck?.status && (
                        <span className="block text-xs text-green-600">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-lg text-center ${
                        production.materialCheck?.status
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Package
                        className={`w-4 h-4 mx-auto mb-1 ${
                          production.materialCheck?.status
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <span className="text-xs font-medium">Material</span>
                      {production.materialCheck?.status ? (
                        <span className="block text-xs text-green-600">
                          ✓ Available
                        </span>
                      ) : (
                        <span className="block text-xs text-red-600">
                          ⚠ Issue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QC Parameters */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" />
                      QC Checks
                    </h4>
                    <div className="space-y-2">
                      {production.qcParameters.map((param) => (
                        <div
                          key={param.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {param.name}:
                            </span>
                            {param.status === "approved" ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                ✓ Approved
                              </span>
                            ) : param.status === "rejected" ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                                ✗ Rejected
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                ⏳ Pending
                              </span>
                            )}
                          </div>
                          {param.status === "pending" && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  const remarks = prompt(
                                    `Enter remarks for ${param.name} (optional):`,
                                  );
                                  handleQCUpdate(
                                    production.id,
                                    param.id,
                                    "approved",
                                    remarks || "",
                                  );
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt(
                                    `Enter rejection reason for ${param.name}:`,
                                  );
                                  if (remarks) {
                                    handleQCUpdate(
                                      production.id,
                                      param.id,
                                      "rejected",
                                      remarks,
                                    );
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete Production Button */}
                  <button
                    onClick={() => handleCompleteProduction(production.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Production
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Production Start Modal */}
      {showProductionStart && selectedWO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Start Production
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  WO: {selectedWO.id} | {selectedWO.clientName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProductionStart(false);
                  setSelectedWO(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Team Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Production Team
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Team Leader <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productionForm.teamLeader}
                      onChange={(e) =>
                        setProductionForm({
                          ...productionForm,
                          teamLeader: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Enter team leader name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Operators (comma separated)
                    </label>
                    <input
                      type="text"
                      value={productionForm.operators.join(", ")}
                      onChange={(e) =>
                        setProductionForm({
                          ...productionForm,
                          operators: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Operator1, Operator2"
                    />
                  </div>
                </div>
              </div>

              {/* Pre-production Checks */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Pre-production Checks
                </h3>

                <div className="space-y-3">
                  {/* Tech Check */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Tech Check</p>
                        <p className="text-xs text-gray-500">
                          Verify machinery and equipment readiness
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={productionForm.techCheck}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            techCheck: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm">Confirmed</span>
                    </label>
                  </div>

                  {/* BOM Check */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">BOM Check</p>
                        <p className="text-xs text-gray-500">
                          Verify Bill of Materials
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={productionForm.bomCheck}
                        onChange={(e) =>
                          setProductionForm({
                            ...productionForm,
                            bomCheck: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm">Confirmed</span>
                    </label>
                  </div>

                  {/* Material Check */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Material Check</p>
                        <p className="text-xs text-gray-500">
                          Raw material availability
                        </p>
                      </div>
                    </div>
                    {productionForm.materialCheck ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ All Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        ⚠ Insufficient
                      </span>
                    )}
                  </div>

                  {/* Insufficient Materials List */}
                  {productionForm.insufficientMaterials.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs font-medium text-red-700 mb-2">
                        Insufficient Materials:
                      </p>
                      <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                        {productionForm.insufficientMaterials.map(
                          (item, idx) => (
                            <li key={idx}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Production Start Time
                    </p>
                    <p className="text-xs text-blue-600">
                      {productionForm.startDate} {productionForm.startTime}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      This timestamp will be recorded automatically
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Production Remarks
                </label>
                <textarea
                  rows="2"
                  value={productionForm.remarks}
                  onChange={(e) =>
                    setProductionForm({
                      ...productionForm,
                      remarks: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProductionStart(false);
                  setSelectedWO(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmProductionStart}
                disabled={
                  !productionForm.teamLeader ||
                  !productionForm.techCheck ||
                  !productionForm.bomCheck
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionManagement;
