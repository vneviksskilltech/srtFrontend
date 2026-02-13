import { useState, useEffect } from "react";
import {
  Search, Trash2,
  Plus, Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Packaging = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = JSON.parse(localStorage.getItem("packagingRecords")) || [];
    // Sort by most recent first
    const sorted = stored.sort((a, b) => 
      new Date(b.packagingDate || 0) - new Date(a.packagingDate || 0)
    );
    setData(sorted);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this packaging record?")) {
      const updated = data.filter((item) => item.id !== id);
      setData(updated);
      localStorage.setItem("packagingRecords", JSON.stringify(updated));
    }
  };

  const handleViewPhotos = (record) => {
    setSelectedRecord(record);
    setShowPhotoModal(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-blue-100 text-blue-700",
      Medium: "bg-yellow-100 text-yellow-700",
      High: "bg-red-100 text-red-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-orange-100 text-orange-700",
      "In Progress": "bg-purple-100 text-purple-700",
      Completed: "bg-green-100 text-green-700",
      "On Hold": "bg-gray-200 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPhotoStatus = (record) => {
    const photos = record.photographs || {};
    const uploaded = [photos.final, photos.during, photos.after].filter(Boolean).length;
    return {
      count: uploaded,
      total: 3,
      isComplete: uploaded === 3
    };
  };

  const filteredData = data.filter((item) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      (item.clientName || item.client || "").toLowerCase().includes(searchTerm) ||
      (item.woNumber || item.wo || "").toLowerCase().includes(searchTerm) ||
      (item.id || "").toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Packaging Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track packaging status, mandatory photos, and dispatch readiness
          </p>
        </div>

        <button
          onClick={() => navigate("/packaging/add")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          New Packaging
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {data.filter(d => d.status === "Pending").length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.filter(d => d.status === "In Progress").length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {data.filter(d => d.status === "Completed").length}
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
              <p className="text-sm text-gray-600">Ready for Dispatch</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.filter(d => d.status === "Completed" && d.expectedDispatch).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Download className="w-6 h-6 text-blue-600" />
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
              placeholder="Search by ID, WO, or Client"
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
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Packaging ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">WO Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Team</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Photos</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const photoStatus = getPhotoStatus(item);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.id}</td>
                      <td className="px-4 py-3">{item.woNumber || item.wo}</td>
                      <td className="px-4 py-3">{item.clientName || item.client}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs truncate max-w-[100px] block">
                          {item.packagingTeam || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewPhotos(item)}
                          className={`flex items-center gap-1 text-xs ${
                            photoStatus.isComplete 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-orange-600 hover:text-orange-700'
                          }`}
                        >
                          <Camera className="w-3 h-3" />
                          <span>{photoStatus.count}/3</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">{item.packedQty || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        {item.status === "Completed" && item.notificationsSent && (
                          <span className="ml-1 text-xs text-green-600" title="Notifications sent">
                            ✓
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div>{item.packagingDate}</div>
                          {item.packagingTime && (
                            <div className="text-gray-500">{item.packagingTime}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPhotos(item)}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600"
                            title="View Photos"
                          >
                            <Camera size={16} />
                          </button>
                          {/* <button
                            onClick={() => navigate(`/packaging/edit/${item.id}`)}
                            className="p-1 hover:bg-gray-50 rounded text-gray-600"
                            title="Edit"
                            disabled={item.status === "Completed"}
                          >
                            <Edit size={16} className={item.status === "Completed" ? "opacity-50" : ""} />
                          </button> */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg">No packaging records found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {search || statusFilter ? "Try adjusting your filters" : "Create your first packaging entry"}
                      </p>
                      <button
                        onClick={() => navigate("/packaging/add")}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-700"
                      >
                        <Plus className="w-4 h-4" />
                        New Packaging
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo View Modal */}
      {showPhotoModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Packaging Photos - {selectedRecord.id}
                </h3>
                <p className="text-sm text-gray-500">
                  WO: {selectedRecord.woNumber || selectedRecord.wo} | Client: {selectedRecord.clientName || selectedRecord.client}
                </p>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Final Product */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Final Product
                  </h4>
                  {selectedRecord.photographs?.final ? (
                    <div>
                      <img
                        src={selectedRecord.photographs.final.data}
                        alt="Final Product"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <p>Uploaded: {new Date(selectedRecord.photographs.final.uploadedAt).toLocaleString()}</p>
                        <p>By: {selectedRecord.photographs.final.uploadedBy || selectedRecord.packagingTeam}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-500">No photo uploaded</p>
                    </div>
                  )}
                </div>

                {/* During Packaging */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    During Packaging
                  </h4>
                  {selectedRecord.photographs?.during ? (
                    <div>
                      <img
                        src={selectedRecord.photographs.during.data}
                        alt="During Packaging"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <p>Uploaded: {new Date(selectedRecord.photographs.during.uploadedAt).toLocaleString()}</p>
                        <p>By: {selectedRecord.photographs.during.uploadedBy || selectedRecord.packagingTeam}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-500">No photo uploaded</p>
                    </div>
                  )}
                </div>

                {/* After Packaging */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    After Packaging
                  </h4>
                  {selectedRecord.photographs?.after ? (
                    <div>
                      <img
                        src={selectedRecord.photographs.after.data}
                        alt="After Packaging"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <p>Uploaded: {new Date(selectedRecord.photographs.after.uploadedAt).toLocaleString()}</p>
                        <p>By: {selectedRecord.photographs.after.uploadedBy || selectedRecord.packagingTeam}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-500">No photo uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              {selectedRecord.photographRemarks && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Remarks</h4>
                  <p className="text-sm text-gray-600">{selectedRecord.photographRemarks}</p>
                </div>
              )}

              {/* Completion Info */}
              {selectedRecord.isCompleted && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">Packaging Completed</p>
                      <p className="text-xs text-green-600">
                        {new Date(selectedRecord.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packaging;