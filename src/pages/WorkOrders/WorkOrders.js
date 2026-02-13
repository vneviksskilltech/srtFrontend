import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Package,
  XCircle,
  Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WorkOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [storeStock, setStoreStock] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [viewMode, setViewMode] = useState("all");
  const [filters, setFilters] = useState({
    wo: "",
    client: "",
    dept: "",
    status: "",
    so: "",
  });

  // Show notification
  const showNotification = useCallback(({ type, title, message }) => {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500"
    };

    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 ${colors[type] || "bg-gray-500"} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md animate-slide-in`;
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="font-medium">${title}</p>
          <p class="text-sm opacity-90">${message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }, []);

  // Send notification to localStorage
  const sendNotification = useCallback((notification) => {
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    const newNotification = {
      id: `NOTIF-${Date.now()}`,
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("notifications", JSON.stringify([...notifications, newNotification]));
  }, []);

  // Generate WO number
  const generateWONumber = useCallback(() => {
    const prefix = "WO";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${random}`;
  }, []);

  // Get operations for item
  const getOperationsForItem = useCallback((description) => {
    const desc = (description || "").toLowerCase();
    
    if (desc.includes("assembly") || desc.includes("assemble")) {
      return ["Cutting", "Milling", "Assembly", "Testing", "Packaging"];
    } else if (desc.includes("fabrication") || desc.includes("weld")) {
      return ["Cutting", "Bending", "Welding", "Grinding", "Painting", "Packaging"];
    } else if (desc.includes("machined") || desc.includes("precision")) {
      return ["Material Preparation", "CNC Machining", "Drilling", "Finishing", "Quality Check", "Packaging"];
    } else {
      return ["Production", "Quality Check", "Packaging"];
    }
  }, []);

  // Get required operations based on items
  const getRequiredOperations = useCallback((items) => {
    const allOperations = new Set();
    
    items.forEach(item => {
      const operations = getOperationsForItem(item?.description || "");
      operations.forEach(op => allOperations.add(op));
    });
    
    return Array.from(allOperations);
  }, [getOperationsForItem]);

  // Get material type from item description
  const getMaterialType = useCallback((description) => {
    const desc = (description || "").toLowerCase();
    
    if (desc.includes("steel") || desc.includes("metal")) {
      return "Steel Plate";
    } else if (desc.includes("aluminum") || desc.includes("aluminium")) {
      return "Aluminum Sheet";
    } else if (desc.includes("plastic") || desc.includes("polymer")) {
      return "Plastic Raw Material";
    } else if (desc.includes("fastener") || desc.includes("bolt") || desc.includes("screw")) {
      return "Fasteners";
    } else if (desc.includes("bearing") || desc.includes("bushing")) {
      return "Bearings";
    } else if (desc.includes("electrical") || desc.includes("wire")) {
      return "Electrical Components";
    } else if (desc.trim() !== "") {
      return "Raw Material";
    }
    
    return null;
  }, []);

  // Get material description
  const getMaterialDescription = useCallback((material) => {
    const descriptions = {
      "Steel Plate": "Mild Steel Plate, 10mm thickness",
      "Aluminum Sheet": "Aluminum 6061 Sheet, 5mm thickness",
      "Plastic Raw Material": "ABS Plastic Granules",
      "Fasteners": "M6 Stainless Steel Bolts & Nuts",
      "Bearings": "Deep Groove Ball Bearings 6205",
      "Electrical Components": "Wires, Switches, Connectors",
      "Raw Material": "General Purpose Raw Material"
    };
    
    return descriptions[material] || "Standard raw material";
  }, []);

  // Get lead time based on priority
  const getLeadTimeDays = useCallback(() => {
    return {
      "High": 7,
      "Medium": 14,
      "Low": 21
    }["Medium"];
  }, []);

  // Determine priority from delivery date
  const getPriorityFromDelivery = useCallback((deliveryDate) => {
    if (!deliveryDate) return "Medium";
    
    try {
      const today = new Date();
      const delivery = new Date(deliveryDate);
      const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) return "High";
      if (diffDays <= 14) return "Medium";
      return "Low";
    } catch (error) {
      return "Medium";
    }
  }, []);

  // Calculate expected completion date
  const calculateExpectedCompletion = useCallback((deliveryDate) => {
    if (deliveryDate) return deliveryDate;
    
    const date = new Date();
    const leadTimeDays = getLeadTimeDays();
    date.setDate(date.getDate() + leadTimeDays);
    return date.toISOString().split('T')[0];
  }, [getLeadTimeDays]);

  // Create material requirements with stock check
  const createMaterialRequirements = useCallback((items, stock) => {
    const requirements = [];
    
    // Group similar materials
    const materialMap = new Map();
    
    items.forEach(item => {
      const materialType = getMaterialType(item?.description || "");
      const quantity = item?.qty || 0;
      
      if (materialType && quantity > 0) {
        if (materialMap.has(materialType)) {
          materialMap.set(materialType, materialMap.get(materialType) + quantity);
        } else {
          materialMap.set(materialType, quantity);
        }
      }
    });
    
    // Create requirements with stock check
    materialMap.forEach((quantity, material) => {
      const stockItem = stock.find(s => s.material === material);
      const stockAvailable = stockItem && stockItem.currentStock >= quantity;
      
      requirements.push({
        material: material,
        description: getMaterialDescription(material),
        requiredQty: quantity,
        unit: "Nos",
        availableQty: stockItem ? stockItem.currentStock : 0,
        stockAvailable: stockAvailable,
        needsReorder: stockItem && stockItem.currentStock < quantity,
        minStockLevel: stockItem ? stockItem.minStock : 0,
        stockItemCode: stockItem ? stockItem.code : "N/A"
      });
    });
    
    return requirements;
  }, [getMaterialType, getMaterialDescription]);

  // Create a new WO from SO with enhanced data
  const createWorkOrderFromSO = useCallback((salesOrder, stock) => {
    // Generate WO number
    const woNumber = generateWONumber();
    
    // Get required operations based on items
    const requiredOperations = getRequiredOperations(salesOrder.items || []);
    
    // Create material requirements with stock check
    const materialRequirements = createMaterialRequirements(salesOrder.items || [], stock);
    const hasInsufficientStock = materialRequirements.some(item => !item.stockAvailable);
    const insufficientMaterials = materialRequirements.filter(item => !item.stockAvailable);
    
    // Calculate dates
    const startDate = new Date().toISOString().split('T')[0];
    const expectedCompletion = calculateExpectedCompletion(salesOrder.deliveryDate);
    
    // Create work order
    const workOrder = {
      id: woNumber,
      soNumber: salesOrder.id || "",
      clientName: salesOrder.clientName || salesOrder.companyName || "",
      clientEmail: salesOrder.email || "",
      clientPhone: salesOrder.phone || "",
      shippingAddress: salesOrder.shippingAddress || "",
      salesPerson: salesOrder.assignedSalesPerson || "",
      orderDate: salesOrder.orderDate || "",
      deliveryDate: salesOrder.deliveryDate || "",
      items: salesOrder.items || [],
      attachments: salesOrder.attachments || [],
      drawings: salesOrder.drawings || salesOrder.attachments || [],
      requiredOperations: requiredOperations,
      materialRequirements: materialRequirements,
      status: hasInsufficientStock ? "Material Request Pending" : "Pending Approval",
      priority: getPriorityFromDelivery(salesOrder.deliveryDate),
      assignedDept: "Production",
      startDate: startDate,
      expectedCompletion: expectedCompletion,
      hasMaterialRequest: hasInsufficientStock,
      materialRequestStatus: hasInsufficientStock ? "pending" : "not_required",
      insufficientMaterials: insufficientMaterials,
      approvalStatus: "pending",
      approvalRemarks: "",
      approvedAt: null,
      approvedBy: null,
      rejectionReason: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create material request if stock is insufficient
    let materialRequest = null;
    if (hasInsufficientStock) {
      materialRequest = {
        id: `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        woNumber: woNumber,
        soNumber: salesOrder.id,
        clientName: salesOrder.clientName,
        requestDate: new Date().toISOString().split('T')[0],
        requestedBy: "System",
        status: "pending",
        items: insufficientMaterials.map(m => ({
          material: m.material,
          description: m.description,
          requiredQty: m.requiredQty,
          availableQty: m.availableQty,
          shortfall: m.requiredQty - m.availableQty,
          unit: m.unit,
          priority: workOrder.priority
        })),
        priority: workOrder.priority,
        createdAt: new Date().toISOString()
      };
    }

    return { workOrder, materialRequest };
  }, [generateWONumber, getRequiredOperations, createMaterialRequirements, getPriorityFromDelivery, calculateExpectedCompletion]);

  // Function to automatically create WOs for imported SOs
  const checkAndCreateWOs = useCallback((soList, woList, stockList) => {
    const newWOs = [];
    const newMaterialRequests = [];
    
    const updatedSOList = soList.map(so => {
      // Check if SO is imported and doesn't have a WO yet
      const hasWOFlag = so.hasWorkOrder || false;
      const existingWO = woList.find(wo => wo.soNumber === so.id);
      
      if (!hasWOFlag && !existingWO) {
        const { workOrder, materialRequest } = createWorkOrderFromSO(so, stockList);
        newWOs.push(workOrder);
        
        if (materialRequest) {
          newMaterialRequests.push(materialRequest);
        }
        
        // Update SO to mark as having WO
        return { ...so, hasWorkOrder: true, workOrderId: workOrder.id };
      }
      return so;
    });
    
    if (newWOs.length > 0) {
      const updatedWOs = [...woList, ...newWOs];
      
      setOrders(updatedWOs);
      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
      setSalesOrders(updatedSOList);
      localStorage.setItem("salesOrders", JSON.stringify(updatedSOList));
      
      if (newMaterialRequests.length > 0) {
        setMaterialRequests(prev => [...prev, ...newMaterialRequests]);
        localStorage.setItem("materialRequests", JSON.stringify([...materialRequests, ...newMaterialRequests]));
      }
      
      // Show notification
      showNotification({
        type: "success",
        title: "Work Orders Created",
        message: `${newWOs.length} Work Order(s) created automatically! ${
          newMaterialRequests.length > 0 
            ? `${newMaterialRequests.length} Material Request(s) flagged.` 
            : ""
        }`
      });
    }
    
    return updatedSOList;
  }, [createWorkOrderFromSO, showNotification, materialRequests]);

  // Load all data
  const loadAllData = useCallback(() => {
    // Load all data from localStorage
    const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
    const storedSOs = JSON.parse(localStorage.getItem("salesOrders")) || [];
    const storedStock = JSON.parse(localStorage.getItem("storeStock")) || [];
    const storedMaterialRequests = JSON.parse(localStorage.getItem("materialRequests")) || [];
    
    // Transform WOs to include approval status if not present
    const updatedWOs = storedWOs.map(wo => ({
      ...wo,
      approvalStatus: wo.approvalStatus || "pending",
      approvalRemarks: wo.approvalRemarks || "",
      approvedAt: wo.approvedAt || null,
      approvedBy: wo.approvedBy || null,
      materialRequestStatus: wo.materialRequestStatus || (wo.hasMaterialRequest ? "pending" : "not_required"),
      materialRequestId: wo.materialRequestId || null,
      rejectionReason: wo.rejectionReason || ""
    }));

    setOrders(updatedWOs);
    setSalesOrders(storedSOs);
    setStoreStock(storedStock);
    setMaterialRequests(storedMaterialRequests);
    
    // Check for newly imported SOs and auto-create WOs
    const updatedSOs = checkAndCreateWOs(storedSOs, updatedWOs, storedStock);
    
    // Update SOs if they were modified
    if (updatedSOs !== storedSOs) {
      setSalesOrders(updatedSOs);
    }
  }, [checkAndCreateWOs]);

  // Initialize data
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Admin Approval Functions
  const handleApproveWO = useCallback((woId) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id === woId) {
          return {
            ...order,
            approvalStatus: "approved",
            approvedAt: new Date().toISOString(),
            approvedBy: "Admin", // In real app, get from auth context
            status: "Approved",
            approvalRemarks: "",
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });

      localStorage.setItem("workOrders", JSON.stringify(updatedOrders));
      return updatedOrders;
    });

    // Get the approved WO for notification
    const approvedWO = orders.find(o => o.id === woId);

    // Send notification to Production
    sendNotification({
      type: "wo_approved",
      title: "Work Order Approved",
      message: `WO ${woId} has been approved and is ready for production`,
      recipient: "production",
      woId: woId,
      priority: approvedWO?.priority
    });

    showNotification({
      type: "success",
      title: "Work Order Approved",
      message: `WO ${woId} has been approved and sent to Production`
    });
  }, [orders, sendNotification, showNotification]);

  const handleRejectWO = useCallback((woId) => {
    const remarks = prompt("Please enter rejection reason:");
    if (remarks === null) return;
    
    if (!remarks.trim()) {
      alert("Rejection reason is required");
      return;
    }

    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id === woId) {
          return {
            ...order,
            approvalStatus: "rejected",
            rejectionReason: remarks,
            status: "Rejected",
            approvedAt: null,
            approvedBy: null,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });

      localStorage.setItem("workOrders", JSON.stringify(updatedOrders));
      return updatedOrders;
    });

    // Send notification back to Sales
    sendNotification({
      type: "wo_rejected",
      title: "Work Order Rejected",
      message: `WO ${woId} has been rejected. Reason: ${remarks}`,
      recipient: "sales",
      woId: woId,
      remarks: remarks
    });

    showNotification({
      type: "error",
      title: "Work Order Rejected",
      message: `WO ${woId} has been rejected`
    });
  }, [sendNotification, showNotification]);

  // Create Material Request
  const handleCreateMaterialRequest = useCallback((woId) => {
    const wo = orders.find(o => o.id === woId);
    if (!wo) return;

    const insufficientMaterials = wo.materialRequirements?.filter(m => !m.stockAvailable) || [];
    
    if (insufficientMaterials.length === 0) {
      alert("No insufficient materials found for this Work Order");
      return;
    }

    const newMaterialRequest = {
      id: `MR-${Date.now()}`,
      woNumber: wo.id,
      soNumber: wo.soNumber,
      clientName: wo.clientName,
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: "Sales",
      status: "pending",
      priority: wo.priority,
      items: insufficientMaterials.map(m => ({
        material: m.material,
        description: m.description,
        requiredQty: m.requiredQty,
        availableQty: m.availableQty,
        shortfall: m.requiredQty - m.availableQty,
        unit: m.unit,
        stockItemCode: m.stockItemCode
      })),
      createdAt: new Date().toISOString()
    };

    setMaterialRequests(prev => {
      const updatedMRs = [...prev, newMaterialRequest];
      localStorage.setItem("materialRequests", JSON.stringify(updatedMRs));
      return updatedMRs;
    });

    // Update WO
    setOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id === woId) {
          return {
            ...order,
            materialRequestStatus: "pending",
            materialRequestId: newMaterialRequest.id,
            status: "Material Request Sent",
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });

      localStorage.setItem("workOrders", JSON.stringify(updatedOrders));
      return updatedOrders;
    });

    showNotification({
      type: "info",
      title: "Material Request Created",
      message: `Material request ${newMaterialRequest.id} has been created`
    });
  }, [orders, showNotification]);

  // Manual WO creation from specific SO
  const createWOFromSO = useCallback((soNumber) => {
    const salesOrder = salesOrders.find(so => so.id === soNumber);
    if (!salesOrder) {
      alert("Sales Order not found!");
      return;
    }
    
    // Check if WO already exists
    const existingWO = orders.find(o => o.soNumber === soNumber);
    if (existingWO) {
      alert(`Work Order ${existingWO.id} already exists for SO ${soNumber}`);
      return;
    }
    
    // Create new WO
    const { workOrder, materialRequest } = createWorkOrderFromSO(salesOrder, storeStock);
    
    setOrders(prev => {
      const updatedWOs = [...prev, workOrder];
      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
      return updatedWOs;
    });
    
    setSalesOrders(prev => {
      const updatedSOs = prev.map(so => 
        so.id === soNumber ? { ...so, hasWorkOrder: true, workOrderId: workOrder.id } : so
      );
      localStorage.setItem("salesOrders", JSON.stringify(updatedSOs));
      return updatedSOs;
    });
    
    if (materialRequest) {
      setMaterialRequests(prev => {
        const updatedMRs = [...prev, materialRequest];
        localStorage.setItem("materialRequests", JSON.stringify(updatedMRs));
        return updatedMRs;
      });
    }
    
    showNotification({
      type: "success",
      title: "Work Order Created",
      message: `Work Order ${workOrder.id} created successfully!`
    });
  }, [salesOrders, orders, storeStock, createWorkOrderFromSO, showNotification]);

  // Delete WO
  const handleDelete = useCallback((woId) => {
    if (window.confirm("Delete this Work Order?")) {
      setOrders(prev => {
        const updated = prev.filter((o) => o.id !== woId);
        localStorage.setItem("workOrders", JSON.stringify(updated));
        return updated;
      });
      
      showNotification({
        type: "info",
        title: "Work Order Deleted",
        message: `WO ${woId} has been deleted`
      });
    }
  }, [showNotification]);

  // Get status color (memoized)
  const getStatusColor = useMemo(() => (status) => {
    const colors = {
      "Pending Approval": "bg-yellow-100 text-yellow-700",
      "Approved": "bg-green-100 text-green-700",
      "Rejected": "bg-red-100 text-red-700",
      "Material Request Pending": "bg-orange-100 text-orange-700",
      "Material Request Sent": "bg-blue-100 text-blue-700",
      "In Production": "bg-cyan-100 text-cyan-700",
      "Completed": "bg-green-100 text-green-700",
      "Cancelled": "bg-red-100 text-red-700",
      "On Hold": "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  }, []);

  // Get approval status color (memoized)
  const getApprovalStatusColor = useMemo(() => (status) => {
    const colors = {
      "pending": "bg-yellow-100 text-yellow-700",
      "approved": "bg-green-100 text-green-700",
      "rejected": "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  }, []);

  // Get priority color (memoized)
  const getPriorityColor = useMemo(() => (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-700",
      Medium: "bg-yellow-100 text-yellow-700",
      High: "bg-red-100 text-red-700",
      Critical: "bg-purple-100 text-purple-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  }, []);

  // Filter orders based on view mode (memoized)
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    
    // Apply view mode filter
    if (viewMode === "pending_approval") {
      filtered = filtered.filter(o => o.approvalStatus === "pending");
    } else if (viewMode === "approved") {
      filtered = filtered.filter(o => o.approvalStatus === "approved");
    } else if (viewMode === "rejected") {
      filtered = filtered.filter(o => o.approvalStatus === "rejected");
    } else if (viewMode === "material_pending") {
      filtered = filtered.filter(o => o.materialRequestStatus === "pending" || o.hasMaterialRequest === true);
    }
    
    // Apply search filters
    return filtered.filter((o) => {
      const woNumber = o?.id || "";
      const clientName = o?.clientName || "";
      const soNumber = o?.soNumber || "";
      const dept = o?.assignedDept || "";
      const status = o?.status || "";
      
      const woLower = woNumber.toString().toLowerCase();
      const clientLower = clientName.toString().toLowerCase();
      const soLower = soNumber.toString().toLowerCase();
      
      const matchesWO = woLower.includes(filters.wo.toLowerCase());
      const matchesClient = clientLower.includes(filters.client.toLowerCase());
      const matchesSO = soLower.includes(filters.so.toLowerCase());
      const matchesDept = !filters.dept || dept === filters.dept;
      const matchesStatus = !filters.status || status === filters.status;
      
      return matchesWO && matchesClient && matchesSO && matchesDept && matchesStatus;
    });
  }, [orders, viewMode, filters]);

  // Get SOs without WOs (memoized)
  const soWithoutWO = useMemo(() => 
    salesOrders.filter(so => !so.hasWorkOrder),
    [salesOrders]
  );

  // Calculate counts (memoized)
  const pendingApprovalCount = useMemo(() => 
    orders.filter(o => o.approvalStatus === "pending").length,
    [orders]
  );
  
  const approvedCount = useMemo(() => 
    orders.filter(o => o.approvalStatus === "approved").length,
    [orders]
  );
  
  const rejectedCount = useMemo(() => 
    orders.filter(o => o.approvalStatus === "rejected").length,
    [orders]
  );
  
  const materialPendingCount = useMemo(() => 
    orders.filter(o => o.materialRequestStatus === "pending" || o.hasMaterialRequest).length,
    [orders]
  );

  // Manual WO creation
  const createManualWO = useCallback(() => {
    navigate("/work-orders/add");
  }, [navigate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Work Orders</h1>
          <p className="text-gray-600 text-sm">Automatically generated from Sales Orders • Admin approval required</p>
        </div>
        <div className="flex gap-3">
          {soWithoutWO.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => createWOFromSO(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white hover:bg-gray-50 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Create WO from SO</option>
                {soWithoutWO.map(so => (
                  <option key={so.id} value={so.id}>
                    {so.id} - {so.clientName || "Unknown Client"}
                  </option>
                ))}
              </select>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {soWithoutWO.length}
              </div>
            </div>
          )}
          <button
            onClick={createManualWO}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Manual WO
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div 
          onClick={() => setViewMode("all")}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
            viewMode === "all" ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total WOs</p>
              <p className="text-2xl font-bold text-gray-700">{orders.length}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setViewMode("pending_approval")}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
            viewMode === "pending_approval" ? "border-yellow-500 ring-1 ring-yellow-500" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingApprovalCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setViewMode("approved")}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
            viewMode === "approved" ? "border-green-500 ring-1 ring-green-500" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setViewMode("rejected")}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
            viewMode === "rejected" ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setViewMode("material_pending")}
          className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
            viewMode === "material_pending" ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Material Request</p>
              <p className="text-2xl font-bold text-orange-600">{materialPendingCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Work Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="WO Number"
            value={filters.wo}
            onChange={(e) => setFilters({ ...filters, wo: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="text"
            placeholder="SO Number"
            value={filters.so}
            onChange={(e) => setFilters({ ...filters, so: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="text"
            placeholder="Client Name"
            value={filters.client}
            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <select
            value={filters.dept}
            onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Departments</option>
            <option value="Production">Production</option>
            <option value="QC">Quality Control</option>
            <option value="Packaging">Packaging</option>
            <option value="Assembly">Assembly</option>
            <option value="Fabrication">Fabrication</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Status</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Material Request Pending">Material Request Pending</option>
            <option value="Material Request Sent">Material Request Sent</option>
            <option value="In Production">In Production</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">WO No</th>
                <th className="px-6 py-3 text-left font-medium">SO No</th>
                <th className="px-6 py-3 text-left font-medium">Client</th>
                <th className="px-6 py-3 text-left font-medium">Approval</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Material</th>
                <th className="px-6 py-3 text-left font-medium">Priority</th>
                <th className="px-6 py-3 text-left font-medium">Dates</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const woId = order?.id || "N/A";
                const soNumber = order?.soNumber || "N/A";
                const clientName = order?.clientName || "Unknown Client";
                const status = order?.status || "Unknown";
                const approvalStatus = order?.approvalStatus || "pending";
                const hasMaterialRequest = order?.hasMaterialRequest || false;
                const materialRequestStatus = order?.materialRequestStatus || "not_required";
                const priority = order?.priority || "Medium";
                const startDate = order?.startDate || "";
                const expectedCompletion = order?.expectedCompletion || "";
                const salesPerson = order?.salesPerson || "";
                const rejectionReason = order?.rejectionReason || "";
                
                return (
                  <tr key={woId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {woId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600 font-medium">{soNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{clientName}</p>
                        {salesPerson && (
                          <p className="text-xs text-gray-500">{salesPerson}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(approvalStatus)}`}>
                          {approvalStatus === "pending" ? "Pending" : 
                           approvalStatus === "approved" ? "Approved" : "Rejected"}
                        </span>
                        {rejectionReason && (
                          <span className="text-xs text-red-600" title={rejectionReason}>
                            {rejectionReason.substring(0, 20)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasMaterialRequest ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {materialRequestStatus === "pending" ? "Request Pending" : "Request Sent"}
                          </span>
                          {materialRequestStatus === "pending" && (
                            <button
                              onClick={() => handleCreateMaterialRequest(woId)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Create Request
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Stock Available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div>Start: {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}</div>
                        <div className="text-gray-500">Due: {expectedCompletion ? new Date(expectedCompletion).toLocaleDateString() : "N/A"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/work-orders/view/${woId}`)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {approvalStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveWO(woId)}
                              className="p-1 hover:bg-green-50 rounded text-green-600"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectWO(woId)}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {approvalStatus === "approved" && (
                          <button
                            onClick={() => navigate(`/work-orders/edit/${woId}`)}
                            className="p-1 hover:bg-gray-50 rounded text-gray-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(woId)}
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

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg">No Work Orders Found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {orders.length > 0 ? "Try adjusting your filters" : "Create your first Work Order"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
        <div>
          Showing {filteredOrders.length} of {orders.length} Work Orders
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full"></span>
            Pending Approval
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></span>
            Approved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></span>
            Rejected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-full"></span>
            Material Required
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;