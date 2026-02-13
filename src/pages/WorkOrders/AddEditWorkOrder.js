import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X } from "lucide-react";

const AddEditWorkOrder = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const { wo } = useParams();

  const [formData, setFormData] = useState({
    id: "",
    soNumber: "",
    clientName: "",
    salesPerson: "",
    orderDate: "",
    deliveryDate: "",
    items: [],
    attachments: [],
    requiredOperations: [],
    materialRequirements: [],
    status: "WO Generated",
    priority: "Medium",
    assignedDept: "Production",
    startDate: new Date().toISOString().split("T")[0],
    expectedCompletion: "",
    hasMaterialRequest: false,
    specialInstructions: "",
  });

  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load sales orders
    const storedSOs = JSON.parse(localStorage.getItem("salesOrders")) || [];
    setSalesOrders(storedSOs);

    if (mode === "edit" && wo) {
      // Load existing WO
      const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
      const found = storedWOs.find((o) => o.id === wo);
      if (found) {
        setFormData(found);
      }
    } else {
      // Generate new WO ID
      const newWOId = generateWONumber();
      setFormData((prev) => ({ ...prev, id: newWOId }));
    }
  }, [mode, wo]);

  // Generate WO number
  const generateWONumber = () => {
    const prefix = "WO";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}-${year}${month}-${random}`;
  };

  // Handle SO selection - COMPLETELY REWRITTEN with safe checks
  const handleSOSelect = (soId) => {
    if (!soId) {
      return; // Don't do anything if no SO is selected
    }
    
    const selectedSO = salesOrders.find((so) => so.id === soId);
    if (!selectedSO) {
      return; // Sales order not found
    }

    // SAFELY get items - ensure it's an array
    const soItems = Array.isArray(selectedSO.items) ? selectedSO.items : [];
    
    // Load stock data
    const storeStock = JSON.parse(localStorage.getItem("storeStock")) || [];

    // Create material requirements - only if there are items
    let materialRequirements = [];
    let hasInsufficientStock = false;
    let requiredOperations = [];

    if (soItems.length > 0) {
      materialRequirements = createMaterialRequirements(soItems, storeStock);
      hasInsufficientStock = materialRequirements.some(
        (item) => item && !item.stockAvailable
      );
      requiredOperations = getRequiredOperations(soItems);
    }

    // Calculate completion date
    const expectedCompletion = calculateExpectedCompletion(
      selectedSO.deliveryDate
    );

    // SAFELY set form data with defaults for all fields
    setFormData({
      ...formData,
      soNumber: selectedSO.id || "",
      clientName: selectedSO.clientName || selectedSO.companyName || "",
      salesPerson: selectedSO.assignedSalesPerson || selectedSO.salesPerson || "",
      orderDate: selectedSO.orderDate || "",
      deliveryDate: selectedSO.deliveryDate || "",
      items: soItems,
      attachments: Array.isArray(selectedSO.attachments) ? selectedSO.attachments : [],
      requiredOperations: requiredOperations,
      materialRequirements: materialRequirements,
      hasMaterialRequest: hasInsufficientStock,
      status: hasInsufficientStock
        ? "Material Request Pending"
        : "WO Generated",
      expectedCompletion: expectedCompletion,
      priority: getPriorityFromDelivery(selectedSO.deliveryDate),
    });
  };

  // Helper functions - with extensive null checks
  const getRequiredOperations = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    const allOperations = new Set();
    items.forEach((item) => {
      if (item && typeof item.description === 'string') {
        const operations = getOperationsForItem(item.description);
        if (Array.isArray(operations)) {
          operations.forEach((op) => allOperations.add(op));
        }
      }
    });
    return Array.from(allOperations);
  };

  const getOperationsForItem = (description) => {
    if (!description || typeof description !== 'string') {
      return ["Production", "Quality Check", "Packaging"];
    }
    
    const desc = description.toLowerCase();
    if (desc.includes("assembly")) {
      return ["Cutting", "Assembly", "Testing", "Packaging"];
    }
    if (desc.includes("fabrication")) {
      return ["Cutting", "Welding", "Grinding", "Painting", "Packaging"];
    }
    if (desc.includes("machined") || desc.includes("precision")) {
      return [
        "CNC Machining",
        "Drilling",
        "Finishing",
        "Quality Check",
        "Packaging",
      ];
    }
    return ["Production", "Quality Check", "Packaging"];
  };

  const createMaterialRequirements = (items, stock) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    const requirements = [];
    const materialMap = new Map();

    items.forEach((item) => {
      if (item && item.description) {
        const materialType = getMaterialType(item.description);
        const quantity = item.qty || 0;
        
        if (materialType && quantity > 0) {
          const currentQty = materialMap.get(materialType) || 0;
          materialMap.set(materialType, currentQty + quantity);
        }
      }
    });

    materialMap.forEach((quantity, material) => {
      const stockItem = Array.isArray(stock) 
        ? stock.find((s) => s && s.material === material)
        : null;
      
      const availableQty = stockItem ? stockItem.currentStock || 0 : 0;
      const stockAvailable = availableQty >= quantity;

      requirements.push({
        material: material || "Unknown",
        description: getMaterialDescription(material),
        requiredQty: quantity,
        unit: "Nos",
        availableQty: availableQty,
        stockAvailable: stockAvailable,
        needsReorder: stockItem && availableQty < quantity,
        minStockLevel: stockItem ? stockItem.minStock || 0 : 0,
        stockItemCode: stockItem ? stockItem.code : "N/A"
      });
    });

    return requirements;
  };

  const getMaterialType = (description) => {
    if (!description || typeof description !== 'string') {
      return null;
    }
    
    const desc = description.toLowerCase();
    if (desc.includes("steel")) return "Steel Plate";
    if (desc.includes("aluminum") || desc.includes("aluminium")) return "Aluminum Sheet";
    if (desc.includes("plastic")) return "Plastic Raw Material";
    if (desc.includes("fastener") || desc.includes("bolt") || desc.includes("screw")) {
      return "Fasteners";
    }
    if (desc.includes("bearing") || desc.includes("bushing")) return "Bearings";
    if (desc.includes("electrical") || desc.includes("wire")) return "Electrical Components";
    if (desc.trim() !== "") return "Raw Material";
    
    return null;
  };

  const getMaterialDescription = (material) => {
    if (!material) return "Standard raw material";
    
    const descriptions = {
      "Steel Plate": "Mild Steel Plate, 10mm thickness",
      "Aluminum Sheet": "Aluminum 6061 Sheet, 5mm thickness",
      "Plastic Raw Material": "ABS Plastic Granules",
      "Fasteners": "Stainless Steel Bolts & Nuts",
      "Bearings": "Deep Groove Ball Bearings 6205",
      "Electrical Components": "Wires, Switches, Connectors",
      "Raw Material": "General Purpose Raw Material",
    };
    return descriptions[material] || "Standard raw material";
  };

  const calculateExpectedCompletion = (deliveryDate) => {
    if (deliveryDate) return deliveryDate;
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split("T")[0];
  };

  const getPriorityFromDelivery = (deliveryDate) => {
    if (!deliveryDate) return "Medium";
    try {
      const today = new Date();
      const delivery = new Date(deliveryDate);
      if (isNaN(delivery.getTime())) return "Medium"; // Invalid date
      
      const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) return "High";
      if (diffDays <= 14) return "Medium";
      return "Low";
    } catch (error) {
      return "Medium";
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new operation
  const addOperation = () => {
    setFormData((prev) => ({
      ...prev,
      requiredOperations: [...(prev.requiredOperations || []), ""],
    }));
  };

  // Remove operation
  const removeOperation = (index) => {
    setFormData((prev) => ({
      ...prev,
      requiredOperations: (prev.requiredOperations || []).filter((_, i) => i !== index),
    }));
  };

  // Save WO
  const handleSave = () => {
    setLoading(true);

    const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
    let updatedWOs;

    if (mode === "edit") {
      updatedWOs = storedWOs.map((o) =>
        o.id === formData.id
          ? { ...formData, updatedAt: new Date().toISOString() }
          : o,
      );
    } else {
      updatedWOs = [
        ...storedWOs,
        {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Update SO to mark as having WO
      if (formData.soNumber) {
        const updatedSOs = salesOrders.map((so) =>
          so.id === formData.soNumber ? { ...so, hasWorkOrder: true } : so,
        );
        localStorage.setItem("salesOrders", JSON.stringify(updatedSOs));
      }
    }

    localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
    setLoading(false);

    alert(
      `${mode === "edit" ? "Updated" : "Created"} Work Order successfully!`,
    );
    navigate("/work-orders");
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "edit" ? "Edit Work Order" : "Create Work Order"}
          </h2>
          <p className="text-gray-600 text-sm">
            {mode === "edit"
              ? "Update work order details"
              : "Create new work order manually or from sales order"}
          </p>
        </div>
        <button
          onClick={() => navigate("/work-orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>

      {/* SO Selection Section */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Link to Sales Order
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Sales Order
            </label>
            <select
              value={formData.soNumber}
              onChange={(e) => handleSOSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select SO</option>
              {salesOrders
                .filter(so => so && !so.hasWorkOrder)
                .map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.id || "N/A"} - {so.clientName || so.companyName || "Unknown Client"} 
                    {so.orderDate ? ` (${so.orderDate})` : ""}
                  </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecting an SO will auto-populate client, items, and material
              requirements
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">OR</div>
              <p className="text-sm text-gray-600 mt-2">
                Create manually below
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WO Number
              </label>
              <input
                type="text"
                name="id"
                value={formData.id || ""}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SO Number
              </label>
              <input
                type="text"
                name="soNumber"
                value={formData.soNumber || ""}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Person
              </label>
              <input
                type="text"
                name="salesPerson"
                value={formData.salesPerson || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                placeholder="Enter sales person"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date
              </label>
              <input
                type="date"
                name="orderDate"
                value={formData.orderDate || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority || "Medium"}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || "WO Generated"}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="WO Generated">WO Generated</option>
                <option value="Material Request Pending">
                  Material Request Pending
                </option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Department
              </label>
              <select
                name="assignedDept"
                value={formData.assignedDept || "Production"}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="Production">Production</option>
                <option value="QC">Quality Control</option>
                <option value="Packaging">Packaging</option>
                <option value="Assembly">Assembly</option>
                <option value="Fabrication">Fabrication</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Completion
              </label>
              <input
                type="date"
                name="expectedCompletion"
                value={formData.expectedCompletion || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        {formData.items && formData.items.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Unit</th>
                    <th className="px-4 py-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.code || "N/A"}</td>
                      <td className="px-4 py-2">{item.description || "N/A"}</td>
                      <td className="px-4 py-2">{item.qty || 0}</td>
                      <td className="px-4 py-2">{item.unit || "Nos"}</td>
                      <td className="px-4 py-2">{item.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Required Operations */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Required Operations
            </h3>
            <button
              type="button"
              onClick={addOperation}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Add Operation
            </button>
          </div>
          <div className="space-y-3">
            {formData.requiredOperations && formData.requiredOperations.length > 0 ? (
              formData.requiredOperations.map((operation, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={operation || ""}
                    onChange={(e) => {
                      const newOperations = [...(formData.requiredOperations || [])];
                      newOperations[index] = e.target.value;
                      setFormData({
                        ...formData,
                        requiredOperations: newOperations,
                      });
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    placeholder="Enter operation"
                  />
                  <button
                    type="button"
                    onClick={() => removeOperation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No operations added yet</p>
            )}
          </div>
        </div>

        {/* Material Requirements */}
        {formData.materialRequirements && formData.materialRequirements.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Material Requirements
            </h3>
            <div
              className={`p-4 rounded-lg mb-4 ${
                formData.hasMaterialRequest
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    formData.hasMaterialRequest ? "bg-red-500" : "bg-green-500"
                  }`}
                ></div>
                <span
                  className={`font-medium ${
                    formData.hasMaterialRequest
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  {formData.hasMaterialRequest
                    ? "⚠️ Material Request Required - Insufficient stock detected"
                    : "✓ All materials available in stock"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Material</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Required Qty</th>
                    <th className="px-4 py-2 text-left">Available Qty</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.materialRequirements.map((material, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{material.material || "N/A"}</td>
                      <td className="px-4 py-2">{material.description || "N/A"}</td>
                      <td className="px-4 py-2">
                        {material.requiredQty || 0} {material.unit || "Nos"}
                      </td>
                      <td className="px-4 py-2">{material.availableQty || 0}</td>
                      <td className="px-4 py-2">
                        {material.stockAvailable ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                            Insufficient
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Special Instructions
          </h3>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions || ""}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
            placeholder="Enter any special instructions for production..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/work-orders")}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading
            ? "Saving..."
            : mode === "edit"
              ? "Update Work Order"
              : "Create Work Order"}
        </button>
      </div>
    </div>
  );
};

export default AddEditWorkOrder;