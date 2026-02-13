import { useState, useEffect } from "react";
import {
  Eye, Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
  FileText,
  Clock,
  User,
  AlertCircle,
  Calendar,
  Building2,
  FileCheck,
  Image
} from "lucide-react";

const QCMonitoring = () => {
  const [qcRecords, setQcRecords] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  // const [selectedWO, setSelectedWO] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // New state for view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // New state for QC inspection
  const [inspectionForm, setInspectionForm] = useState({
    woNumber: "",
    clientName: "",
    department: "",
    inspectorName: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    parameters: [
      { id: 1, name: "Harry", status: "pending", remarks: "" },
      { id: 2, name: "Machinery", status: "pending", remarks: "" },
      { id: 3, name: "Color", status: "pending", remarks: "" },
      { id: 4, name: "Assembly", status: "pending", remarks: "" }
    ],
    overallStatus: "pending",
    rejectionRemarks: "",
    photographs: [],
    inspectionTime: new Date().toLocaleTimeString(),
    priority: "Medium"
  });

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load QC records
    const storedQC = JSON.parse(localStorage.getItem("qcRecords")) || [];
    console.log("Loaded QC Records:", storedQC); // Debug log
    
    // Add default status if not present in existing records
    const updatedQC = storedQC.map(record => ({
      id: record.id || `QC-${Date.now()}-${Math.random()}`,
      woNumber: record.woNumber || record.wo || "",
      clientName: record.clientName || record.client || "",
      department: record.department || record.dept || "Production",
      inspectorName: record.inspectorName || "",
      inspectionDate: record.inspectionDate || record.qcDueSince || new Date().toISOString().split('T')[0],
      inspectionTime: record.inspectionTime || "",
      parameters: record.parameters || [
        { id: 1, name: "Harry", status: record.harryStatus || "pending", remarks: record.harryRemarks || "" },
        { id: 2, name: "Machinery", status: record.machineryStatus || "pending", remarks: record.machineryRemarks || "" },
        { id: 3, name: "Color", status: record.colorStatus || "pending", remarks: record.colorRemarks || "" },
        { id: 4, name: "Assembly", status: record.assemblyStatus || "pending", remarks: record.assemblyRemarks || "" }
      ],
      overallStatus: record.overallStatus || "pending",
      rejectionRemarks: record.rejectionRemarks || "",
      photographs: record.photographs || [],
      priority: record.priority || "Medium",
      submittedAt: record.submittedAt || record.createdAt || new Date().toISOString()
    }));
    
    setQcRecords(updatedQC);
    
    // Load work orders that are ready for QC (Completed or In Production)
    const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
    const readyForQC = storedWOs.filter(wo => 
      wo.status === "Completed" || 
      wo.status === "In Production" || 
      wo.status === "WO Generated"
    );
    setWorkOrders(readyForQC);
  };

  // Save to localStorage
  const saveToStorage = (data) => {
    localStorage.setItem("qcRecords", JSON.stringify(data));
    setQcRecords(data); // Update state immediately
  };

  // Load WO details for inspection
  const handleSelectWO = (woNumber) => {
    if (!woNumber) {
      // setSelectedWO(null);
      return;
    }
    
    const wo = workOrders.find(w => w.id === woNumber);
    if (wo) {
      // setSelectedWO(wo);
      setInspectionForm(prev => ({
        ...prev,
        woNumber: wo.id,
        clientName: wo.clientName || wo.client || "",
        department: wo.assignedDept || "Production",
        priority: wo.priority || "Medium"
      }));
    }
  };

  // Handle parameter approval/rejection
  const handleParameterStatus = (parameterId, status) => {
    setInspectionForm(prev => ({
      ...prev,
      parameters: prev.parameters.map(param =>
        param.id === parameterId ? { ...param, status } : param
      )
    }));
  };

  // Handle parameter remarks
  const handleParameterRemarks = (parameterId, remarks) => {
    setInspectionForm(prev => ({
      ...prev,
      parameters: prev.parameters.map(param =>
        param.id === parameterId ? { ...param, remarks } : param
      )
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInspectionForm(prev => ({
          ...prev,
          photographs: [
            ...prev.photographs,
            {
              id: Date.now() + Math.random(),
              name: file.name,
              data: event.target.result,
              type: file.type,
              uploadedAt: new Date().toISOString()
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove photo
  const handleRemovePhoto = (photoId) => {
    setInspectionForm(prev => ({
      ...prev,
      photographs: prev.photographs.filter(p => p.id !== photoId)
    }));
  };

  // Calculate overall status based on parameters
  const calculateOverallStatus = (parameters) => {
    if (parameters.some(p => p.status === "rejected")) {
      return "rejected";
    }
    if (parameters.every(p => p.status === "approved")) {
      return "approved";
    }
    return "pending";
  };

  // Submit QC inspection
  const handleSubmitInspection = (action) => {
    // Validate required fields
    if (!inspectionForm.inspectorName.trim()) {
      alert("Please enter inspector name");
      return;
    }

    if (!inspectionForm.woNumber) {
      alert("Please select a Work Order");
      return;
    }

    // Check if all parameters have been decided (not pending)
    const hasPending = inspectionForm.parameters.some(p => p.status === "pending");
    if (hasPending) {
      alert("Please complete all parameter checks before submitting");
      return;
    }

    // Calculate overall status
    const overallStatus = action === "approve" ? "approved" : 
                         action === "reject" ? "rejected" : 
                         calculateOverallStatus(inspectionForm.parameters);

    // Validate rejection remarks
    if (overallStatus === "rejected" && !inspectionForm.rejectionRemarks.trim()) {
      alert("Please provide rejection remarks");
      return;
    }

    const newQCReport = {
      id: `QC-${Date.now()}`,
      ...inspectionForm,
      overallStatus,
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionTime: new Date().toLocaleTimeString(),
      inspectorName: inspectionForm.inspectorName,
      submittedAt: new Date().toISOString(),
      rejectionRemarks: overallStatus === "rejected" ? inspectionForm.rejectionRemarks : ""
    };

    const updatedRecords = [...qcRecords, newQCReport];
    saveToStorage(updatedRecords);
    console.log("Saved QC Record:", newQCReport); // Debug log

    // Update Work Order status based on QC result
    if (inspectionForm.woNumber) {
      const allWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
      const updatedWOs = allWOs.map(wo => {
        if (wo.id === inspectionForm.woNumber) {
          return {
            ...wo,
            status: overallStatus === "approved" ? "Completed" : "In Production",
            qcStatus: overallStatus,
            qcRemarks: overallStatus === "rejected" ? inspectionForm.rejectionRemarks : "",
            qcInspectedAt: new Date().toISOString(),
            qcInspector: inspectionForm.inspectorName
          };
        }
        return wo;
      });
      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
      
      // Update work orders state
      const readyForQC = updatedWOs.filter(wo => 
        wo.status === "Completed" || 
        wo.status === "In Production" || 
        wo.status === "WO Generated"
      );
      setWorkOrders(readyForQC);
    }

    // Reset form
    resetForm();
    setShowForm(false);
    // setSelectedWO(null);
  };

  // Reset form
  const resetForm = () => {
    setInspectionForm({
      woNumber: "",
      clientName: "",
      department: "",
      inspectorName: "",
      inspectionDate: new Date().toISOString().split('T')[0],
      parameters: [
        { id: 1, name: "Harry", status: "pending", remarks: "" },
        { id: 2, name: "Machinery", status: "pending", remarks: "" },
        { id: 3, name: "Color", status: "pending", remarks: "" },
        { id: 4, name: "Assembly", status: "pending", remarks: "" }
      ],
      overallStatus: "pending",
      rejectionRemarks: "",
      photographs: [],
      inspectionTime: new Date().toLocaleTimeString(),
      priority: "Medium"
    });
  };

  // Delete QC record
  const handleDelete = (id) => {
    if (window.confirm("Delete this QC inspection record?")) {
      const updated = qcRecords.filter((record) => record.id !== id);
      saveToStorage(updated);
    }
  };

  // View QC report details
  const handleViewReport = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-100 text-red-700",
      Medium: "bg-yellow-100 text-yellow-700",
      Low: "bg-green-100 text-green-700"
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  // Filter records based on status
  const filteredRecords = qcRecords.filter(record => {
    if (statusFilter === "all") return true;
    return record.overallStatus === statusFilter;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QC Monitoring & Inspection</h1>
          <p className="text-gray-600 text-sm mt-1">
            Quality Control checks for completed products
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> New Inspection
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {qcRecords.filter(r => r.overallStatus === "pending").length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {qcRecords.filter(r => r.overallStatus === "approved").length}
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
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {qcRecords.filter(r => r.overallStatus === "rejected").length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-700">
                {qcRecords.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Records</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredRecords.length} of {qcRecords.length} records
          </div>
        </div>
      </div>

      {/* QC Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">WO Number</th>
                <th className="px-6 py-3 text-left font-medium">Client</th>
                <th className="px-6 py-3 text-left font-medium">Department</th>
                <th className="px-6 py-3 text-left font-medium">Inspector</th>
                <th className="px-6 py-3 text-left font-medium">Date & Time</th>
                <th className="px-6 py-3 text-left font-medium">Parameters</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {record.woNumber}
                    </td>
                    <td className="px-6 py-4">{record.clientName || "N/A"}</td>
                    <td className="px-6 py-4">{record.department}</td>
                    <td className="px-6 py-4">{record.inspectorName}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div>{record.inspectionDate}</div>
                        <div className="text-gray-500">{record.inspectionTime || ""}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {record.parameters?.map((param, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs">
                            <span className="font-medium">{param.name}:</span>
                            {param.status === "approved" ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : param.status === "rejected" ? (
                              <XCircle className="w-3 h-3 text-red-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-yellow-600" />
                            )}
                            {param.remarks && (
                              <span className="text-gray-500 truncate max-w-[100px]" title={param.remarks}>
                                ({param.remarks.substring(0, 15)}...)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.overallStatus)}`}>
                        {record.overallStatus?.charAt(0).toUpperCase() + record.overallStatus?.slice(1)}
                      </span>
                      {record.overallStatus === "rejected" && record.rejectionRemarks && (
                        <div className="mt-1 text-xs text-red-600 truncate max-w-[150px]" title={record.rejectionRemarks}>
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {record.rejectionRemarks.substring(0, 20)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReport(record)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg">No QC records found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {statusFilter !== "all" ? `No ${statusFilter} inspections` : "Start a new inspection"}
                      </p>
                      <button
                        onClick={() => {
                          resetForm();
                          setShowForm(true);
                        }}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-700"
                      >
                        <Plus className="w-4 h-4" />
                        New Inspection
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Report Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">QC Inspection Report</h2>
                  <p className="text-sm text-gray-600">Work Order: {selectedRecord.woNumber}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRecord(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                selectedRecord.overallStatus === 'approved' ? 'bg-green-50 border border-green-200' :
                selectedRecord.overallStatus === 'rejected' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                {getStatusIcon(selectedRecord.overallStatus)}
                <div>
                  <p className={`font-semibold ${
                    selectedRecord.overallStatus === 'approved' ? 'text-green-700' :
                    selectedRecord.overallStatus === 'rejected' ? 'text-red-700' :
                    'text-yellow-700'
                  }`}>
                    Overall Status: {selectedRecord.overallStatus?.charAt(0).toUpperCase() + selectedRecord.overallStatus?.slice(1)}
                  </p>
                  {selectedRecord.overallStatus === 'rejected' && selectedRecord.rejectionRemarks && (
                    <p className="text-sm text-red-600 mt-1">
                      <span className="font-medium">Rejection Reason:</span> {selectedRecord.rejectionRemarks}
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-medium">WORK ORDER</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedRecord.woNumber}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">INSPECTOR</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedRecord.inspectorName}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">DATE & TIME</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedRecord.inspectionDate} {selectedRecord.inspectionTime}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <FileCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">PRIORITY</span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRecord.priority)}`}>
                    {selectedRecord.priority}
                  </span>
                </div>
              </div>

              {/* Client and Department Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Client Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRecord.clientName || "N/A"}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRecord.department}</p>
                </div>
              </div>

              {/* Parameters Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  QC Parameters Check
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Parameter</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRecord.parameters?.map((param, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{param.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              param.status === 'approved' ? 'bg-green-100 text-green-700' :
                              param.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {param.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                              {param.status === 'rejected' && <XCircle className="w-3 h-3" />}
                              {param.status === 'pending' && <Clock className="w-3 h-3" />}
                              {param.status?.charAt(0).toUpperCase() + param.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {param.remarks || <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Photographs Section */}
              {selectedRecord.photographs && selectedRecord.photographs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Image className="w-5 h-5 text-blue-600" />
                    Inspection Photographs ({selectedRecord.photographs.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedRecord.photographs.map((photo, index) => (
                      <div key={photo.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={photo.data}
                          alt={photo.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-gray-50">
                          <p className="text-xs text-gray-600 truncate" title={photo.name}>
                            {photo.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedRecord.submittedAt && (
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <p className="text-xs text-gray-400">
                    Report ID: {selectedRecord.id} | Submitted: {new Date(selectedRecord.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">New QC Inspection</h2>
                <p className="text-sm text-gray-600">Complete quality checks for finished product</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  // setSelectedWO(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* WO Selection */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Work Order for Inspection
                </label>
                <select
                  onChange={(e) => handleSelectWO(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={inspectionForm.woNumber}
                >
                  <option value="">-- Select Work Order --</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.id} - {wo.clientName || wo.client || "Unknown"} ({wo.status})
                    </option>
                  ))}
                </select>
                {workOrders.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    No work orders available for QC inspection
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={inspectionForm.clientName}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={inspectionForm.department}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${getPriorityColor(inspectionForm.priority)}`}>
                    {inspectionForm.priority}
                  </span>
                </div>
              </div>

              {/* Inspector Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspector Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={inspectionForm.inspectorName}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspectorName: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter inspector name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={inspectionForm.inspectionDate}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* QC Parameters Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  QC Check Parameters
                </h3>
                
                <div className="space-y-4">
                  {inspectionForm.parameters.map((param) => (
                    <div key={param.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="font-medium text-gray-700 min-w-[100px]">
                          {param.name}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleParameterStatus(param.id, "approved")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                              param.status === "approved"
                                ? "bg-green-600 text-white"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleParameterStatus(param.id, "rejected")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                              param.status === "rejected"
                                ? "bg-red-600 text-white"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                          {param.status === "pending" && (
                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Remarks (if any)"
                          value={param.remarks}
                          onChange={(e) => handleParameterRemarks(param.id, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photographs Upload Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Inspection Photographs
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg px-4 py-3 flex items-center gap-2 text-blue-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Choose Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500">
                      Upload clear photographs of the finished product
                    </span>
                  </div>
                </div>

                {/* Photo Preview Grid */}
                {inspectionForm.photographs.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {inspectionForm.photographs.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.data}
                          alt={photo.name}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection Remarks Section (shown when any parameter is rejected) */}
              {inspectionForm.parameters.some(p => p.status === "rejected") && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Rejection Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={inspectionForm.rejectionRemarks}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, rejectionRemarks: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Please specify the reason for rejection and any corrective actions required..."
                    required
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  // setSelectedWO(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              
              {inspectionForm.parameters.some(p => p.status === "rejected") ? (
                <button
                  onClick={() => handleSubmitInspection("reject")}
                  disabled={!inspectionForm.rejectionRemarks.trim() || !inspectionForm.inspectorName.trim() || !inspectionForm.woNumber}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Submit as Rejected
                </button>
              ) : (
                <button
                  onClick={() => handleSubmitInspection("approve")}
                  disabled={inspectionForm.parameters.some(p => p.status === "pending") || !inspectionForm.inspectorName.trim() || !inspectionForm.woNumber}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit as Approved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QCMonitoring;