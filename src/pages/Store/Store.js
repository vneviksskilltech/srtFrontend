import React, { useState, useEffect } from "react";
import {
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Plus,
  Search, Trash2, History,
  BarChart3,
  FileText,
  RefreshCw
} from "lucide-react";

const StoreManagement = () => {
  const [storeStock, setStoreStock] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [consumptionRecords, setConsumptionRecords] = useState([]);
  const [viewMode, setViewMode] = useState("stock");
  const [search, setSearch] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  
  // Modal states
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showProcessRequestModal, setShowProcessRequestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [updateStockQty, setUpdateStockQty] = useState("");
  const [updateStockType, setUpdateStockType] = useState("");
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [stockForm, setStockForm] = useState({
    code: "",
    material: "",
    description: "",
    category: "",
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    unit: "Nos",
    location: "",
    supplier: "",
    lastUpdated: new Date().toISOString()
  });

  // Load all store data
  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = () => {
    // Load store stock
    const storedStock = JSON.parse(localStorage.getItem("storeStock")) || [];
    
    // Load material requests
    const storedRequests = JSON.parse(localStorage.getItem("materialRequests")) || [];
    
    // Load work orders for consumption tracking
    const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
    
    // Load consumption records
    const storedConsumption = JSON.parse(localStorage.getItem("consumptionRecords")) || [];

    // Initialize with default stock if empty
    if (storedStock.length === 0) {
      const defaultStock = [
        {
          id: `STK-${Date.now()}-1`,
          code: "STL-PL-10",
          material: "Steel Plate",
          description: "Mild Steel Plate, 10mm thickness",
          category: "Metal",
          currentStock: 150,
          minStock: 50,
          maxStock: 500,
          unit: "Nos",
          location: "A-101",
          supplier: "Tata Steel",
          lastUpdated: new Date().toISOString(),
          reorderLevel: 75,
          costPerUnit: 2500
        },
        {
          id: `STK-${Date.now()}-2`,
          code: "ALM-SH-5",
          material: "Aluminum Sheet",
          description: "Aluminum 6061 Sheet, 5mm thickness",
          category: "Metal",
          currentStock: 80,
          minStock: 30,
          maxStock: 300,
          unit: "Nos",
          location: "A-102",
          supplier: "Hindalco",
          lastUpdated: new Date().toISOString(),
          reorderLevel: 45,
          costPerUnit: 1800
        },
        {
          id: `STK-${Date.now()}-3`,
          code: "PLAST-ABS",
          material: "Plastic Raw Material",
          description: "ABS Plastic Granules",
          category: "Polymer",
          currentStock: 500,
          minStock: 100,
          maxStock: 1000,
          unit: "Kg",
          location: "B-201",
          supplier: "BASF",
          lastUpdated: new Date().toISOString(),
          reorderLevel: 200,
          costPerUnit: 120
        },
        {
          id: `STK-${Date.now()}-4`,
          code: "FST-M6",
          material: "Fasteners",
          description: "M6 Stainless Steel Bolts & Nuts",
          category: "Hardware",
          currentStock: 25,
          minStock: 50,
          maxStock: 500,
          unit: "Set",
          location: "C-301",
          supplier: "Unbrako",
          lastUpdated: new Date().toISOString(),
          reorderLevel: 75,
          costPerUnit: 15
        },
        {
          id: `STK-${Date.now()}-5`,
          code: "BRG-6205",
          material: "Bearings",
          description: "Deep Groove Ball Bearings 6205",
          category: "Components",
          currentStock: 45,
          minStock: 30,
          maxStock: 200,
          unit: "Nos",
          location: "D-401",
          supplier: "SKF",
          lastUpdated: new Date().toISOString(),
          reorderLevel: 40,
          costPerUnit: 350
        }
      ];
      localStorage.setItem("storeStock", JSON.stringify(defaultStock));
      setStoreStock(defaultStock);
    } else {
      setStoreStock(storedStock);
    }

    setMaterialRequests(storedRequests);
    setWorkOrders(storedWOs);
    setConsumptionRecords(storedConsumption);
  };

  // Process material request (approve/reject)
  const handleProcessRequest = (requestId, status) => {
    const updatedRequests = materialRequests.map(req => {
      if (req.id === requestId) {
        const processedRequest = {
          ...req,
          status: status,
          processedAt: new Date().toISOString(),
          processedBy: "Store Manager",
          remarks: status === "rejected" ? rejectionRemarks : "Stock available"
        };

        // If approved, update stock levels
        if (status === "approved") {
          updateStockOnApproval(req);
        }

        return processedRequest;
      }
      return req;
    });

    setMaterialRequests(updatedRequests);
    localStorage.setItem("materialRequests", JSON.stringify(updatedRequests));

    // Update work order status
    const request = materialRequests.find(r => r.id === requestId);
    if (request) {
      const updatedWOs = workOrders.map(wo => {
        if (wo.id === request.woNumber) {
          return {
            ...wo,
            materialRequestStatus: status,
            materialRequestProcessedAt: new Date().toISOString(),
            status: status === "approved" ? "Ready for Production" : "Material Request Rejected"
          };
        }
        return wo;
      });
      setWorkOrders(updatedWOs);
      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
    }

    setShowProcessRequestModal(false);
    setSelectedRequest(null);
    setRejectionRemarks("");
    setModalMessage(`Material Request ${status === "approved" ? "Approved" : "Rejected"} successfully!`);
    setShowSuccessModal(true);
  };

  // Update stock when material request is approved
 // Update stock when material request is approved
const updateStockOnApproval = (request) => {
  const updatedStock = storeStock.map(stock => {
    // Handle case where request has items array
    if (request.items && Array.isArray(request.items)) {
      const requestItem = request.items.find(item => item.material === stock.material);
      if (requestItem) {
        const newStock = stock.currentStock - (requestItem.shortfall || 0);
        return {
          ...stock,
          currentStock: Math.max(0, newStock),
          lastUpdated: new Date().toISOString(),
          lastIssueQuantity: requestItem.shortfall || 0,
          lastIssueDate: new Date().toISOString(),
          lastIssueFor: request.woNumber || request.wo
        };
      }
    } 
    // Handle case where request has direct material property (single item request)
    else if (request.material === stock.material) {
      const shortfall = (request.requiredQty || 0) - (request.currentStock || 0);
      const newStock = stock.currentStock - shortfall;
      return {
        ...stock,
        currentStock: Math.max(0, newStock),
        lastUpdated: new Date().toISOString(),
        lastIssueQuantity: shortfall,
        lastIssueDate: new Date().toISOString(),
        lastIssueFor: request.woNumber || request.wo
      };
    }
    return stock;
  });

  setStoreStock(updatedStock);
  localStorage.setItem("storeStock", JSON.stringify(updatedStock));

  // Create consumption record - handle both array and single item cases
  const consumptionItems = [];
  
  if (request.items && Array.isArray(request.items)) {
    // Multiple items case
    request.items.forEach(item => {
      consumptionItems.push({
        ...item,
        issuedQty: item.shortfall || 0,
        issuedAt: new Date().toISOString()
      });
    });
  } else {
    // Single item case
    consumptionItems.push({
      material: request.material,
      code: request.code,
      requiredQty: request.requiredQty,
      shortfall: (request.requiredQty || 0) - (request.currentStock || 0),
      unit: request.unit,
      issuedQty: (request.requiredQty || 0) - (request.currentStock || 0),
      issuedAt: new Date().toISOString()
    });
  }

  const consumptionRecord = {
    id: `CONS-${Date.now()}`,
    requestId: request.id,
    woNumber: request.woNumber || request.wo,
    soNumber: request.soNumber,
    issuedAt: new Date().toISOString(),
    issuedBy: "Store Manager",
    items: consumptionItems
  };

  const updatedConsumption = [...consumptionRecords, consumptionRecord];
  setConsumptionRecords(updatedConsumption);
  localStorage.setItem("consumptionRecords", JSON.stringify(updatedConsumption));
};

  // Add new stock item
  const handleAddStock = () => {
    if (!stockForm.code || !stockForm.material) {
      setModalMessage("Please fill in required fields");
      setShowSuccessModal(true);
      return;
    }

    const newStock = {
      id: `STK-${Date.now()}`,
      ...stockForm,
      currentStock: parseFloat(stockForm.currentStock) || 0,
      minStock: parseFloat(stockForm.minStock) || 10,
      maxStock: parseFloat(stockForm.maxStock) || 100,
      lastUpdated: new Date().toISOString()
    };

    const updatedStock = [...storeStock, newStock];
    setStoreStock(updatedStock);
    localStorage.setItem("storeStock", JSON.stringify(updatedStock));

    setShowAddStockModal(false);
    setStockForm({
      code: "",
      material: "",
      description: "",
      category: "",
      currentStock: 0,
      minStock: 10,
      maxStock: 100,
      unit: "Nos",
      location: "",
      supplier: "",
      lastUpdated: new Date().toISOString()
    });

    setModalMessage("Stock item added successfully!");
    setShowSuccessModal(true);
  };

  // Update stock level (add/reduce)
  const handleUpdateStock = () => {
    if (!updateStockQty || parseFloat(updateStockQty) <= 0) {
      setModalMessage("Please enter a valid quantity");
      setShowSuccessModal(true);
      return;
    }

    const updatedStock = storeStock.map(stock => {
      if (stock.id === selectedMaterial.id) {
        let newStock = stock.currentStock;
        if (updateStockType === "add") {
          newStock += parseFloat(updateStockQty);
        } else if (updateStockType === "reduce") {
          newStock = Math.max(0, stock.currentStock - parseFloat(updateStockQty));
        }

        return {
          ...stock,
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
          lastTransactionType: updateStockType,
          lastTransactionQty: updateStockQty,
          lastTransactionDate: new Date().toISOString()
        };
      }
      return stock;
    });

    setStoreStock(updatedStock);
    localStorage.setItem("storeStock", JSON.stringify(updatedStock));
    
    setShowUpdateStockModal(false);
    setSelectedMaterial(null);
    setUpdateStockQty("");
    setUpdateStockType("");
    setModalMessage(`Stock ${updateStockType === "add" ? "added" : "reduced"} successfully!`);
    setShowSuccessModal(true);
  };

  // Delete stock item
  const handleDeleteStock = () => {
    const updatedStock = storeStock.filter(s => s.id !== selectedMaterial.id);
    setStoreStock(updatedStock);
    localStorage.setItem("storeStock", JSON.stringify(updatedStock));
    
    setShowDeleteModal(false);
    setSelectedMaterial(null);
    setModalMessage("Stock item deleted successfully!");
    setShowSuccessModal(true);
  };

  // Generate material request for low stock
  const handleReorderStock = () => {
    const reorderQuantity = selectedMaterial.maxStock - selectedMaterial.currentStock;
    
    const newMaterialRequest = {
      id: `MR-${Date.now()}`,
      type: "reorder",
      material: selectedMaterial.material,
      code: selectedMaterial.code,
      requiredQty: reorderQuantity,
      currentStock: selectedMaterial.currentStock,
      minStock: selectedMaterial.minStock,
      maxStock: selectedMaterial.maxStock,
      unit: selectedMaterial.unit,
      supplier: selectedMaterial.supplier,
      status: "pending",
      requestedAt: new Date().toISOString(),
      requestedBy: "Store System",
      priority: selectedMaterial.currentStock < selectedMaterial.minStock ? "High" : "Medium",
      remarks: `Auto-generated reorder: Current stock ${selectedMaterial.currentStock} is below minimum ${selectedMaterial.minStock}`
    };

    const updatedRequests = [...materialRequests, newMaterialRequest];
    setMaterialRequests(updatedRequests);
    localStorage.setItem("materialRequests", JSON.stringify(updatedRequests));

    setShowReorderModal(false);
    setSelectedMaterial(null);
    setModalMessage(`Reorder request created for ${selectedMaterial.material}`);
    setShowSuccessModal(true);
  };

  // Generate consumption report for completed WO
  // const generateConsumptionReport = (woNumber) => {
  //   const wo = workOrders.find(w => w.id === woNumber);
  //   if (!wo) return;

  //   const consumption = consumptionRecords.filter(c => c.woNumber === woNumber);
  //   const materialRequirements = wo.materialRequirements || [];

  //   const report = {
  //     id: `RPT-${Date.now()}`,
  //     woNumber: woNumber,
  //     soNumber: wo.soNumber,
  //     clientName: wo.clientName,
  //     generatedAt: new Date().toISOString(),
  //     generatedBy: "Store System",
  //     plannedMaterials: materialRequirements,
  //     actualConsumption: consumption.flatMap(c => c.items || []),
  //     variance: calculateVariance(materialRequirements, consumption),
  //     status: "completed"
  //   };

  //   return report;
  // };

  // Calculate variance between planned and actual consumption
  // const calculateVariance = (planned, actual) => {
  //   const actualItems = actual.flatMap(c => c.items || []);
  //   const variance = [];

  //   planned.forEach(plannedItem => {
  //     const actualItem = actualItems.find(a => a.material === plannedItem.material);
  //     const actualQty = actualItem?.issuedQty || 0;
  //     variance.push({
  //       material: plannedItem.material,
  //       planned: plannedItem.requiredQty,
  //       actual: actualQty,
  //       variance: actualQty - plannedItem.requiredQty,
  //       variancePercent: ((actualQty - plannedItem.requiredQty) / plannedItem.requiredQty * 100).toFixed(2)
  //     });
  //   });

  //   return variance;
  // };

  // Check low stock items
  const lowStockItems = storeStock.filter(item => 
    item.currentStock <= item.minStock
  );

  // Filter stock based on search
  const filteredStock = storeStock.filter(item => {
    const searchTerm = search.toLowerCase();
    return (
      item.material.toLowerCase().includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  });

  // Filter material requests
  const filteredRequests = materialRequests.filter(req => {
    const searchTerm = search.toLowerCase();
    return (
      req.woNumber?.toLowerCase().includes(searchTerm) ||
      req.material?.toLowerCase().includes(searchTerm) ||
      req.code?.toLowerCase().includes(searchTerm)
    );
  });

  // Open update stock modal
  const openUpdateStockModal = (item, type) => {
    setSelectedMaterial(item);
    setUpdateStockType(type);
    setUpdateStockQty("");
    setShowUpdateStockModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (item) => {
    setSelectedMaterial(item);
    setShowDeleteModal(true);
  };

  // Open reorder modal
  const openReorderModal = (item) => {
    setSelectedMaterial(item);
    setShowReorderModal(true);
  };

  // Open process request modal
  const openProcessRequestModal = (request, status) => {
    setSelectedRequest(request);
    if (status === "rejected") {
      setShowProcessRequestModal(true);
    } else {
      handleProcessRequest(request.id, "approved");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stock Monitoring • Material Requests • Consumption Tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddStockModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Stock Item
          </button>
          <button
            onClick={loadStoreData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700">
                  Low Stock Alert: {lowStockItems.length} item(s) below minimum level
                </p>
                <p className="text-sm text-red-600">
                  {lowStockItems.map(item => `${item.material} (${item.currentStock}/${item.minStock})`).join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterLowStock(true)}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6 inline-flex">
        <button
          onClick={() => setViewMode("stock")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            viewMode === "stock" 
              ? "bg-red-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Package className="w-4 h-4" />
          Stock Inventory
        </button>
        <button
          onClick={() => setViewMode("requests")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            viewMode === "requests" 
              ? "bg-red-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Material Requests
          {materialRequests.filter(r => r.status === "pending").length > 0 && (
            <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
              {materialRequests.filter(r => r.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setViewMode("consumption")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            viewMode === "consumption" 
              ? "bg-red-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Consumption History
        </button>
        <button
          onClick={() => setViewMode("reports")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            viewMode === "reports" 
              ? "bg-red-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Reports
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${viewMode}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {viewMode === "stock" && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filterLowStock}
                  onChange={(e) => setFilterLowStock(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Show Low Stock Only
              </label>
            </div>
          )}
        </div>
      </div>

      {/* STOCK INVENTORY VIEW */}
      {viewMode === "stock" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Material</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Current Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Min/Max</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Last Updated</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(filterLowStock ? filteredStock.filter(item => item.currentStock <= item.minStock) : filteredStock).map((item) => {
                  const stockPercentage = (item.currentStock / item.maxStock) * 100;
                  const isLowStock = item.currentStock <= item.minStock;
                  const isCritical = item.currentStock <= (item.minStock * 0.5);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{item.code}</td>
                      <td className="px-4 py-3 font-medium">{item.material}</td>
                      <td className="px-4 py-3 text-gray-600">{item.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`font-bold ${
                            isCritical ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.currentStock} {item.unit}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-red-600' : isLowStock ? 'bg-orange-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">
                          Min: {item.minStock}<br />
                          Max: {item.maxStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isCritical ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Critical Low
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{item.location}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUpdateStockModal(item, "add")}
                            className="p-1 hover:bg-green-50 rounded text-green-600"
                            title="Add Stock"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openUpdateStockModal(item, "reduce")}
                            className="p-1 hover:bg-orange-50 rounded text-orange-600"
                            title="Reduce Stock"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                          {isLowStock && (
                            <button
                              onClick={() => openReorderModal(item)}
                              className="p-1 hover:bg-blue-50 rounded text-blue-600"
                              title="Reorder Stock"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg">No stock items found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATERIAL REQUESTS VIEW */}
      {viewMode === "requests" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">WO/SO</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Material</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Required</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Available</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Shortfall</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr className="bg-gray-50">
                      <td colSpan="10" className="px-4 py-2 text-xs font-medium text-gray-700">
                        {request.id} - Requested on {new Date(request.requestedAt || request.createdAt || request.requestDate).toLocaleDateString()}
                        {request.woNumber && ` | WO: ${request.woNumber}`}
                        {request.soNumber && ` | SO: ${request.soNumber}`}
                      </td>
                    </tr>
                    {request.items ? (
                      request.items.map((item, idx) => (
                        <tr key={`${request.id}-${idx}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3">{request.woNumber || request.wo}</td>
                          <td className="px-4 py-3">{request.clientName}</td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{item.material}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.requiredQty} {item.unit}</td>
                          <td className="px-4 py-3">{item.availableQty || 0} {item.unit}</td>
                          <td className="px-4 py-3 font-bold text-red-600">{item.shortfall} {item.unit}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.priority === "High" ? "bg-red-100 text-red-700" :
                              request.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {request.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "approved" ? "bg-green-100 text-green-700" :
                              request.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {request.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openProcessRequestModal(request, "approved")}
                                  className="p-1 hover:bg-green-50 rounded text-green-600"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openProcessRequestModal(request, "rejected")}
                                  className="p-1 hover:bg-red-50 rounded text-red-600"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {request.status === "approved" && (
                              <span className="text-xs text-green-600">✓ Issued</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3">{request.woNumber || request.wo}</td>
                        <td className="px-4 py-3">{request.clientName}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{request.material}</div>
                            <div className="text-xs text-gray-500">{request.code}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{request.requiredQty} {request.unit}</td>
                        <td className="px-4 py-3">{request.currentStock} {request.unit}</td>
                        <td className="px-4 py-3 font-bold text-red-600">
                          {request.requiredQty - request.currentStock} {request.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.priority === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            request.status === "approved" ? "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {request.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openProcessRequestModal(request, "approved")}
                                className="p-1 hover:bg-green-50 rounded text-green-600"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openProcessRequestModal(request, "rejected")}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg">No material requests found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONSUMPTION HISTORY VIEW */}
      {viewMode === "consumption" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">WO Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">SO Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Material</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Quantity</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Unit</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Issued By</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consumptionRecords.length > 0 ? (
                  consumptionRecords.map((record) => (
                    record.items.map((item, idx) => (
                      <tr key={`${record.id}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(record.issuedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium">{record.woNumber}</td>
                        <td className="px-4 py-3">{record.soNumber}</td>
                        <td className="px-4 py-3">{item.material}</td>
                        <td className="px-4 py-3 font-bold">{item.issuedQty || item.shortfall}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">{record.issuedBy}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{record.requestId}</td>
                      </tr>
                    ))
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <History className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg">No consumption records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS VIEW */}
      {viewMode === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Stock Summary
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-600">{storeStock.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{storeStock.reduce((sum, item) => sum + (item.currentStock * (item.costPerUnit || 0)), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(storeStock.map(i => i.category)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Material Request Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Material Request Summary
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {materialRequests.filter(r => r.status === "pending").length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {materialRequests.filter(r => r.status === "approved").length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {materialRequests.filter(r => r.status === "rejected").length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-600">{materialRequests.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consumption Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Recent Consumption
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Material</th>
                    <th className="px-4 py-2 text-left">Total Consumed</th>
                    <th className="px-4 py-2 text-left">Last Issued</th>
                    <th className="px-4 py-2 text-left">WO Numbers</th>
                  </tr>
                </thead>
                <tbody>
                  {storeStock.map(item => {
                    const consumed = consumptionRecords
                      .flatMap(r => r.items || [])
                      .filter(i => i.material === item.material)
                      .reduce((sum, i) => sum + (i.issuedQty || i.shortfall || 0), 0);
                    
                    if (consumed === 0) return null;
                    
                    return (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-2 font-medium">{item.material}</td>
                        <td className="px-4 py-2">{consumed} {item.unit}</td>
                        <td className="px-4 py-2 text-gray-500">
                          {item.lastIssueDate ? new Date(item.lastIssueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600">
                          {item.lastIssueFor || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Add New Stock Item</h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Material Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stockForm.code}
                    onChange={(e) => setStockForm({...stockForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., STL-PL-10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stockForm.material}
                    onChange={(e) => setStockForm({...stockForm, material: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., Steel Plate"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={stockForm.description}
                    onChange={(e) => setStockForm({...stockForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Detailed description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={stockForm.category}
                    onChange={(e) => setStockForm({...stockForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Category</option>
                    <option value="Metal">Metal</option>
                    <option value="Polymer">Polymer</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Components">Components</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <select
                    value={stockForm.unit}
                    onChange={(e) => setStockForm({...stockForm, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Kg">Kg</option>
                    <option value="Meter">Meter</option>
                    <option value="Liter">Liter</option>
                    <option value="Set">Set</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={stockForm.currentStock}
                    onChange={(e) => setStockForm({...stockForm, currentStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    value={stockForm.minStock}
                    onChange={(e) => setStockForm({...stockForm, minStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    value={stockForm.maxStock}
                    onChange={(e) => setStockForm({...stockForm, maxStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={stockForm.location}
                    onChange={(e) => setStockForm({...stockForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., A-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={stockForm.supplier}
                    onChange={(e) => setStockForm({...stockForm, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Supplier name"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAddStockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStock}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Stock Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateStockModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {updateStockType === "add" ? "Add Stock" : "Reduce Stock"}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {updateStockType === "add" ? "Add quantity to" : "Reduce quantity from"}: <span className="font-semibold">{selectedMaterial.material}</span>
              </p>
              <p className="text-xs text-gray-500 mb-2">Current Stock: {selectedMaterial.currentStock} {selectedMaterial.unit}</p>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Quantity to {updateStockType === "add" ? "Add" : "Reduce"}
                </label>
                <input
                  type="number"
                  value={updateStockQty}
                  onChange={(e) => setUpdateStockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Enter quantity"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>
              
              {updateStockType === "reduce" && parseFloat(updateStockQty) > selectedMaterial.currentStock && (
                <p className="text-xs text-red-600 mb-4">
                  Warning: Reducing more than current stock will result in negative stock!
                </p>
              )}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUpdateStockModal(false);
                  setSelectedMaterial(null);
                  setUpdateStockQty("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className={`px-6 py-2 text-white rounded-lg ${
                  updateStockType === "add" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {updateStockType === "add" ? "Add Stock" : "Reduce Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete this stock item?
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedMaterial.material} - {selectedMaterial.code}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current Stock: {selectedMaterial.currentStock} {selectedMaterial.unit}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMaterial(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStock}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Stock Modal */}
      {showReorderModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Reorder</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Create reorder request for:
                </p>
                <p className="text-sm font-medium text-gray-900">{selectedMaterial.material}</p>
                <p className="text-xs text-gray-500">{selectedMaterial.code}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium">{selectedMaterial.currentStock} {selectedMaterial.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Minimum Level:</span>
                  <span className="font-medium">{selectedMaterial.minStock} {selectedMaterial.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maximum Level:</span>
                  <span className="font-medium">{selectedMaterial.maxStock} {selectedMaterial.unit}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-blue-600 pt-2 border-t">
                  <span>Reorder Quantity:</span>
                  <span>{selectedMaterial.maxStock - selectedMaterial.currentStock} {selectedMaterial.unit}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReorderModal(false);
                  setSelectedMaterial(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReorderStock}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Reorder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Request Modal (Rejection) */}
      {showProcessRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Reject Material Request</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Please provide a reason for rejecting this request:
              </p>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Rejection Remarks
                </label>
                <textarea
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows="3"
                  placeholder="Enter reason for rejection..."
                  autoFocus
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Request ID:</span> {selectedRequest.id}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Material:</span> {selectedRequest.material || selectedRequest.items?.[0]?.material}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProcessRequestModal(false);
                  setSelectedRequest(null);
                  setRejectionRemarks("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessRequest(selectedRequest.id, "rejected")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!rejectionRemarks.trim()}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Success</h3>
                  <p className="text-sm text-gray-600 mt-1">{modalMessage}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;