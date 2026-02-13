import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  ArrowLeft,
  FileText,
  Package,
  Users,
  Calendar
} from "lucide-react";

const WorkOrderView = () => {
  const { wo } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [salesOrder, setSalesOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem("workOrders") || "[]");
      // Use both 'id' and 'wo' to find the work order for backward compatibility
      const found = stored.find((o) => o.id === wo || o.wo === wo);
      setWorkOrder(found);

      if (found) {
        const salesOrders = JSON.parse(
          localStorage.getItem("salesOrders") || "[]",
        );
        // Use both 'soNumber' and 'so' for backward compatibility
        const so = salesOrders.find(
          (s) =>
            s.id === found.soNumber ||
            s.soNumber === found.soNumber ||
            s.id === found.so ||
            s.soNumber === found.so,
        );
        setSalesOrder(so);
      }
    } catch (error) {
      console.error("Error loading work order:", error);
    } finally {
      setLoading(false);
    }
  }, [wo]);

  // const handlePrint = () => {
  //   window.print();
  // };

  const getStatusColor = (status) => {
    const colors = {
      Imported: "bg-blue-100 text-blue-700",
      "Under Review": "bg-yellow-100 text-yellow-700",
      "WO Generated": "bg-purple-100 text-purple-700",
      "Material Request Pending": "bg-orange-100 text-orange-700",
      "In Production": "bg-cyan-100 text-cyan-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
      "On Hold": "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-700",
      Medium: "bg-yellow-100 text-yellow-700",
      High: "bg-red-100 text-red-700",
      Critical: "bg-purple-100 text-purple-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Work Order...</p>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Work Order Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The work order with ID "{wo}" could not be found in the system.
          </p>
          <button
            onClick={() => navigate("/work-orders")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Work Orders
          </button>
        </div>
      </div>
    );
  }

  // Safely get values with defaults for backward compatibility
  const woNumber = workOrder.id || workOrder.wo || "N/A";
  const soNumber = workOrder.soNumber || workOrder.so || "N/A";
  const clientName =
    workOrder.clientName || workOrder.client || "Unknown Client";
  const status = workOrder.status || "Unknown";
  const priority = workOrder.priority || "Medium";
  const startDate = workOrder.startDate || "";
  const expectedCompletion = workOrder.expectedCompletion || "";
  const createdAt = workOrder.createdAt || "";
  const quantity =
    workOrder.quantity ||
    workOrder.items?.reduce((sum, item) => sum + (item.qty || 0), 0) ||
    0;
  const unit = workOrder.unit || "Nos";
  const salesPerson =
    workOrder.salesPerson || salesOrder?.assignedSalesPerson || "Not specified";
  const requiredOperations = workOrder.requiredOperations || [];
  const materialRequirements = workOrder.materialRequirements || [];
  const hasMaterialRequest = workOrder.hasMaterialRequest || false;
  const specialInstructions = workOrder.specialInstructions || "";
  const drawings = workOrder.drawings || workOrder.attachments || [];
  const assignedDept = workOrder.assignedDept || "Production";

  return (
    <div className="p-6 bg-gray-50 min-h-screen print:bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate("/work-orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <div className="flex gap-3">
          {/* <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print
          </button> */}
          <button
            onClick={() =>
              alert("PDF download functionality would be implemented here")
            }
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Work Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200 print:shadow-none print:border-none">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Work Order
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-semibold text-gray-700">
                  {woNumber}
                </span>
              </div>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Linked to SO:{" "}
                  <span className="font-semibold">{soNumber}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}
            >
              {status}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}
            >
              Priority: {priority}
            </span>
          </div>
        </div>

        {/* Client and Dates Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Client Information
              </h3>
              <p className="text-lg font-semibold text-gray-800">
                {clientName}
              </p>
              <p className="text-sm text-gray-600">Sales: {salesPerson}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Assigned Department
              </h3>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 font-medium">
                  {assignedDept}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Order Details
              </h3>
              <div className="space-y-1">
                <p className="text-gray-700">
                  Total Quantity:{" "}
                  <span className="font-semibold">
                    {quantity} {unit}
                  </span>
                </p>
                <p className="text-gray-700">
                  Items:{" "}
                  <span className="font-semibold">
                    {workOrder.items?.length || 0}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Created
              </h3>
              <p className="text-gray-700">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not available"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-gray-700 font-medium">
                      {startDate
                        ? new Date(startDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Expected Completion</p>
                    <p className="text-gray-700 font-medium">
                      {expectedCompletion
                        ? new Date(expectedCompletion).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      {workOrder.items && workOrder.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Items ({workOrder.items.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workOrder.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {item.code || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.description || "No description"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {item.qty || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.unit || "Nos"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Required Operations */}
      {requiredOperations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Required Operations
          </h3>
          <div className="flex flex-wrap gap-3">
            {requiredOperations.map((op, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200"
              >
                {op}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Material Requirements */}
      {materialRequirements.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Material Requirements
            </h3>
            {hasMaterialRequest && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Material Request Required
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materialRequirements.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.material || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.description || "No description"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {item.requiredQty || 0} {item.unit || "Nos"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.availableQty || 0}
                    </td>
                    <td className="px-4 py-3">
                      {item.stockAvailable ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Available
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Insufficient
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMaterialRequest && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-1">
                    Material Request Required
                  </h4>
                  <p className="text-red-600 text-sm">
                    One or more materials have insufficient stock levels. Please
                    create a material request to proceed with production.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special Instructions */}
      {specialInstructions && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Special Instructions
          </h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {specialInstructions}
            </p>
          </div>
        </div>
      )}

      {/* Drawings/Attachments Section */}
      {drawings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Attachments ({drawings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drawings.map((drawing, index) => {
              const name = drawing.name || `Attachment ${index + 1}`;
              const size = drawing.size
                ? `${(drawing.size / 1024).toFixed(1)} KB`
                : "Unknown size";
              const dataUrl = drawing.data || drawing.url;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800 truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{size}</p>
                    </div>
                  </div>

                  {dataUrl && drawing.type?.startsWith("image/") && (
                    <div className="mb-3">
                      <img
                        src={dataUrl}
                        alt={name}
                        className="w-full h-40 object-contain rounded border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EImage%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {dataUrl && (
                      <>
                        <a
                          href={dataUrl}
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex-1 text-center py-2 rounded border border-blue-200 hover:bg-blue-50"
                        >
                          View
                        </a>
                        <a
                          href={dataUrl}
                          download={name}
                          className="text-sm text-green-600 hover:text-green-800 hover:underline flex-1 text-center py-2 rounded border border-green-200 hover:bg-green-50"
                        >
                          Download
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderView;
