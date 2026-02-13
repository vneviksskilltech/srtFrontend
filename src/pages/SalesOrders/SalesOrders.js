import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye, Trash2,
  Plus,
  Search, Edit,
  Save
} from "lucide-react";

// Sales Orders List Component
const SalesOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("salesOrders")) || [];
    setOrders(storedOrders);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deleteOrder = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this order?")) {
      const updatedOrders = orders.filter((order) => order.id !== id);
      setOrders(updatedOrders);
      localStorage.setItem("salesOrders", JSON.stringify(updatedOrders));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Imported: "bg-blue-100 text-blue-800",
      "Under Review": "bg-yellow-100 text-yellow-800",
      "WO Generated": "bg-purple-100 text-purple-800",
      "In Production": "bg-orange-100 text-orange-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Draft: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // const getWOStatusColor = (woStatus) => {
  //   return woStatus === "Linked"
  //     ? "bg-green-100 text-green-800"
  //     : "bg-gray-100 text-gray-800";
  // };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
        <button
          onClick={() => navigate("/sales-orders/add")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Sales Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by SO Number, Client..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option>Draft</option>
            <option>Imported</option>
            <option>Under Review</option>
            <option>WO Generated</option>
            <option>In Production</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SO No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order, idx) => (
                <tr
                  key={order.id || idx}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/sales-orders/${order.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id || `DRAFT-${idx}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.clientName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {order.totalOrderValue
                      ? `₹${order.totalOrderValue.toLocaleString()}`
                      : "₹0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.orderDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.deliveryDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status || "Draft"}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/sales-orders/${order.id}`)}
                        className="text-gray-600 hover:text-gray-900 transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/sales-orders/edit/${order.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => deleteOrder(order.id, e)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sales orders found. Click "Add Sales Order" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add/Edit Sales Order Component
const AddEditSalesOrder = ({ mode = "add" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: "",
    clientName: "",
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    assignedSalesPerson: "",
    items: [],
    baseAmount: 0,
    gstRate: 18,
    gstAmount: 0,
    discount: 0,
    totalOrderValue: 0,
    paymentTerms: "50% Advance",
    advanceReceived: false,
    remarks: "",
    status: "Draft",
    companyName: "",
    gstNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    shippingAddress: "",
    deliveryContact: "",
    deliveryPhone: "",
  });

  const [newItem, setNewItem] = useState({
    productType: "",
    code: "",
    description: "",
    qty: 1,
    unit: "Nos",
    remarks: "",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      const storedOrders =
        JSON.parse(localStorage.getItem("salesOrders")) || [];
      const orderToEdit = storedOrders.find((order) => order.id === id);
      if (orderToEdit) {
        setFormData(orderToEdit);
      }
    } else {
      // Generate new ID for add mode
      const newId = `SO-${Date.now().toString().slice(-6)}`;
      setFormData((prev) => ({ ...prev, id: newId }));
    }
  }, [mode, id]);

  const baseAmount = Number(formData.baseAmount) || 0;
  const gstRate = Number(formData.gstRate) || 0;
  const discount = Number(formData.discount) || 0;

  const gstAmount = Number(((baseAmount * gstRate) / 100).toFixed(2));
  const totalOrderValue = Number(
    (baseAmount + gstAmount - discount).toFixed(2),
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddItem = () => {
    if (newItem.code && newItem.description) {
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, { ...newItem, id: Date.now() }],
      }));
      setNewItem({
        productType:"",
        code: "",
        description: "",
        qty: 1,
        unit: "Nos",
        remarks: "",
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleSaveOrder = () => {
    const storedOrders = JSON.parse(localStorage.getItem("salesOrders")) || [];

    const orderToSave = {
      ...formData,
      baseAmount,
      gstRate,
      discount,
      gstAmount,
      totalOrderValue,
      updatedAt: new Date().toISOString(),
    };

    if (mode === "edit") {
      const updatedOrders = storedOrders.map((order) =>
        order.id === formData.id ? orderToSave : order,
      );
      localStorage.setItem("salesOrders", JSON.stringify(updatedOrders));
    } else {
      const newOrder = {
        ...orderToSave,
        status: "Under Review",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "salesOrders",
        JSON.stringify([...storedOrders, newOrder]),
      );
    }

    navigate("/sales-orders");
  };

  const handleSaveDraft = () => {
    const storedOrders = JSON.parse(localStorage.getItem("salesOrders")) || [];
    const newOrder = {
      ...formData,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "salesOrders",
      JSON.stringify([...storedOrders, newOrder]),
    );
    navigate("/sales-orders");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/sales-orders")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "edit" ? "Edit Sales Order" : "Add Sales Order"}
        </h1>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <button
                onClick={() => setStep(stepNum)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    step === stepNum
                      ? "bg-red-600 text-white"
                      : step > stepNum
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
              >
                {stepNum}
              </button>
              {stepNum < 3 && (
                <div
                  className={`w-16 h-1 ${step > stepNum ? "bg-green-600" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {step === 1 && "Basic Info"}
          {step === 2 && "Order Items"}
          {step === 3 && "Commercials"}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-6">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date
              </label>
              <input
                type="date"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Sales Person
              </label>
              <input
                type="text"
                name="assignedSalesPerson"
                value={formData.assignedSalesPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter sales person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter contact person"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter contact number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </label>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter shipping address"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label> */}
                <select
                  name="productType"
                  value={newItem.productType}
                  onChange={(e) =>
                    setNewItem({ ...newItem, productType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="EWSM">EWSM</option>
                  <option value="MWSM">MWSM</option>
                  <option value="ECB">ECB</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Item Code"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={newItem.code}
                onChange={(e) =>
                  setNewItem({ ...newItem, code: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description"
                className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Qty"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: parseInt(e.target.value) || 1 })
                }
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Item Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.code}</td>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-sm">{item.qty}</td>
                      <td className="px-4 py-3 text-sm">{item.unit}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No items added yet. Add items using the form above.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                COMMERCIAL DETAILS
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="baseAmount"
                    value={formData.baseAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    name="gstRate"
                    value={formData.gstRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Amount:</span>
                  <span className="font-semibold">
                    ₹{formData.baseAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    GST ({formData.gstRate}%):
                  </span>
                  <span className="font-semibold">
                    ₹{gstAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">
                    -₹{formData.discount.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-bold">Total Order Value:</span>
                  <span className="text-lg font-bold">
                    ₹{totalOrderValue.toLocaleString()}
                  </span>
                </div>
                {/* <div className="mt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="advanceReceived"
                      checked={formData.advanceReceived}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Advance Received
                    </span>
                  </label>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {mode === "add" && (
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Save as Draft
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSaveOrder}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mode === "edit" ? "Update Order" : "Create Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sales Order Details Component (simplified from your original)
const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("salesOrders")) || [];
    const foundOrder = storedOrders.find((order) => order.id === id);
    setOrder(foundOrder);
  }, [id]);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Order not found</p>
        <button
          onClick={() => navigate("/sales-orders")}
          className="mt-4 text-red-600 hover:text-red-800"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/sales-orders")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {order.clientName}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-600">
              SO: <span className="font-medium">{order.id}</span>
            </span>
            <span className="text-sm text-gray-600">
              Status:
              <span
                className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "In Production"
                      ? "bg-orange-100 text-orange-800"
                      : order.status === "Under Review"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/sales-orders/edit/${order.id}`)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <Edit className="w-4 h-4" />
          Edit Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              CLIENT DETAILS
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Company Name:</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.companyName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Person:</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.contactPerson}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone:</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.phone}
                </p>
              </div>
            </div>
          </div>

          {/* SO Summary */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ORDER SUMMARY
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.orderDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.deliveryDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sales Person:</span>
                <span className="text-sm font-medium text-gray-900">
                  {order.assignedSalesPerson}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Item Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items &&
                    order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{item.code}</td>
                        <td className="px-6 py-4 text-sm">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-sm">{item.qty}</td>
                        <td className="px-6 py-4 text-sm">{item.unit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial Details */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              COMMERCIAL DETAILS
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Base Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{order.baseAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  GST ({order.gstRate}%):
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{order.gstAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <span className="text-sm font-medium text-red-600">
                  -₹{order.discount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-900">
                  Total Order Value:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{order.totalOrderValue?.toLocaleString()}
                </span>
              </div>
              {/* <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Advance Received:</span>
                <span
                  className={`text-sm font-medium ${order.advanceReceived ? "text-green-600" : "text-red-600"}`}
                >
                  {order.advanceReceived ? "Yes" : "No"}
                </span>
              </div> */}
              {order.remarks && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Remarks:</p>
                  <p className="text-sm text-gray-900">{order.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SalesOrders, SalesOrderDetails, AddEditSalesOrder };
