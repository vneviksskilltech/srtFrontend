import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Upload, X, CheckCircle } from "lucide-react";

const AddEditPackaging = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    id: "",
    woNumber: "",
    soNumber: "",
    clientName: "",
    qcStatus: "Approved",
    qcApprovedBy: "",
    qcApprovedDate: "",
    packedQty: "",
    priority: "Medium",
    status: "Pending",
    expectedDispatch: "",
    packagingTeam: "",
    packagingDate: new Date().toISOString().split("T")[0],
    packagingTime: "",
    photographs: {
      final: null,
      during: null,
      after: null,
    },
    photographRemarks: "",
    isCompleted: false,
    completedAt: null,
    notificationsSent: false,
  });

  const [qcRecords, setQcRecords] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [photoErrors, setPhotoErrors] = useState({});

  useEffect(() => {
    // Load QC approved work orders
    const storedQC = JSON.parse(localStorage.getItem("qcRecords")) || [];
    const approvedQC = storedQC.filter(
      (record) => record.overallStatus?.toLowerCase() === "approved",
    );
    setQcRecords(approvedQC);

    const storedWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
    setWorkOrders(storedWOs);

    if (mode === "edit" && id) {
      const stored = JSON.parse(localStorage.getItem("packagingRecords")) || [];
      const found = stored.find((item) => item.id === id);
      if (found) {
        setFormData(found);
        // Remove this block as selectedWO is no longer used
        // if (found.woNumber) {
        //   const wo = storedWOs.find(w => w.id === found.woNumber);
        //   setSelectedWO(wo);
        // }
      }
    } else {
      const newId = `PKG-${Date.now().toString().slice(-6)}`;
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        id: newId,
        packagingDate: now.toISOString().split("T")[0],
        packagingTime: now.toLocaleTimeString(),
      }));
    }
  }, [mode, id]);

  // Handle WO selection from QC approved list
 const handleSelectWO = (woNumber) => {
    if (!woNumber) {
      // Remove setSelectedWO(null);
      return;
    }

    // Find the QC record for this WO
    const qcRecord = qcRecords.find((r) => r.woNumber === woNumber);
    const wo = workOrders.find((w) => w.id === woNumber);

    if (qcRecord && wo) {
      // setSelectedWO(wo);
      setFormData((prev) => ({
        ...prev,
        woNumber: wo.id,
        soNumber: wo.soNumber || qcRecord.soNumber || "",
        clientName: wo.clientName || qcRecord.clientName || "",
        qcStatus: "Approved",
        qcApprovedBy: qcRecord.inspectorName || "",
        qcApprovedDate: qcRecord.inspectionDate || "",
        packedQty:
          wo.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0,
        priority: wo.priority || "Medium",
      }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPhotoErrors((prev) => ({
        ...prev,
        [type]: "Please upload an image file",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoErrors((prev) => ({
        ...prev,
        [type]: "File size should be less than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        photographs: {
          ...prev.photographs,
          [type]: {
            name: file.name,
            data: event.target.result,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            uploadedBy: prev.packagingTeam || "Unknown",
          },
        },
      }));

      // Clear error for this type
      setPhotoErrors((prev) => ({ ...prev, [type]: null }));
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = (type) => {
    setFormData((prev) => ({
      ...prev,
      photographs: {
        ...prev.photographs,
        [type]: null,
      },
    }));
  };

  // Validate all required photos are uploaded
  const validatePhotos = () => {
    const required = ["final", "during", "after"];
    const missing = required.filter((type) => !formData.photographs[type]);

    if (missing.length > 0) {
      const errors = {};
      missing.forEach((type) => {
        errors[type] =
          `${type.charAt(0).toUpperCase() + type.slice(1)} product photo is required`;
      });
      setPhotoErrors(errors);
      return false;
    }
    return true;
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "packedQty") {
      setFormData((prev) => ({
        ...prev,
        packedQty: value,
        status: value > 0 ? "In Progress" : "Pending",
      }));
    } else if (name === "packagingTeam") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Send notifications to Sales & Admin
  const sendNotifications = (packagingData) => {
    // In a real app, this would call an API to send emails/notifications
    console.log(
      "Sending notifications for completed packaging:",
      packagingData,
    );

    // Create notification records
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    const newNotifications = [
      {
        id: `NOTIF-${Date.now()}-1`,
        type: "packaging_completed",
        title: "Packaging Completed",
        message: `Work Order ${packagingData.woNumber} has been packaged and is ready for dispatch`,
        recipient: "Sales",
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          packagingId: packagingData.id,
          woNumber: packagingData.woNumber,
        },
      },
      {
        id: `NOTIF-${Date.now()}-2`,
        type: "packaging_completed",
        title: "Packaging Completed",
        message: `Work Order ${packagingData.woNumber} has been packaged and is ready for dispatch`,
        recipient: "Admin",
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          packagingId: packagingData.id,
          woNumber: packagingData.woNumber,
        },
      },
    ];

    localStorage.setItem(
      "notifications",
      JSON.stringify([...notifications, ...newNotifications]),
    );
    return true;
  };

  // Handle confirm packaging completion
  const handleConfirmPackaging = () => {
    // Validate all required photos
    if (!validatePhotos()) {
      alert(
        "Please upload all 3 required photos before confirming packaging completion",
      );
      return;
    }

    if (!formData.packagingTeam.trim()) {
      alert("Please enter packaging team details");
      return;
    }

    if (!formData.packedQty || formData.packedQty <= 0) {
      alert("Please enter packed quantity");
      return;
    }

    const now = new Date();
    const updatedFormData = {
      ...formData,
      status: "Completed",
      isCompleted: true,
      completedAt: now.toISOString(),
      packagingTime: formData.packagingTime || now.toLocaleTimeString(),
      notificationsSent: true,
    };

    // Send notifications
    sendNotifications(updatedFormData);

    // Save packaging record
    const stored = JSON.parse(localStorage.getItem("packagingRecords")) || [];

    if (mode === "edit") {
      const updated = stored.map((item) =>
        item.id === updatedFormData.id ? updatedFormData : item,
      );
      localStorage.setItem("packagingRecords", JSON.stringify(updated));
    } else {
      localStorage.setItem(
        "packagingRecords",
        JSON.stringify([...stored, updatedFormData]),
      );
    }

    // Update Work Order status
    if (updatedFormData.woNumber) {
      const allWOs = JSON.parse(localStorage.getItem("workOrders")) || [];
      const updatedWOs = allWOs.map((wo) => {
        if (wo.id === updatedFormData.woNumber) {
          return {
            ...wo,
            status: "Packaging Completed",
            packagingStatus: "Completed",
            packagedAt: now.toISOString(),
            packagingId: updatedFormData.id,
            packagingTeam: updatedFormData.packagingTeam,
          };
        }
        return wo;
      });
      localStorage.setItem("workOrders", JSON.stringify(updatedWOs));
    }

    alert(
      "Packaging completed successfully! Notifications sent to Sales and Admin.",
    );
    navigate("/packaging");
  };

  // Save draft
  const handleSaveDraft = () => {
    const stored = JSON.parse(localStorage.getItem("packagingRecords")) || [];

    if (mode === "edit") {
      const updated = stored.map((item) =>
        item.id === formData.id ? formData : item,
      );
      localStorage.setItem("packagingRecords", JSON.stringify(updated));
    } else {
      localStorage.setItem(
        "packagingRecords",
        JSON.stringify([...stored, formData]),
      );
    }

    alert("Draft saved successfully!");
    navigate("/packaging");
  };

  // Check if all required photos are uploaded
  const allPhotosUploaded = () => {
    return (
      formData.photographs.final &&
      formData.photographs.during &&
      formData.photographs.after
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "edit"
                ? "Edit Packaging Record"
                : "New Packaging Entry"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "edit"
                ? "Update packaging details and photos"
                : "Complete packaging process with mandatory photo uploads"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              formData.status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {formData.status}
          </span>
        </div>

        {/* QC Approved WO Selection */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select QC Approved Work Order
          </label>
          <select
            onChange={(e) => handleSelectWO(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={formData.woNumber}
            disabled={mode === "edit"}
          >
            <option value="">-- Select QC Approved WO --</option>
            {qcRecords.map((record) => (
              <option key={record.id} value={record.woNumber}>
                {record.woNumber} - {record.clientName} (QC Approved:{" "}
                {record.inspectionDate})
              </option>
            ))}
          </select>
          {qcRecords.length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              No QC approved work orders available for packaging
            </p>
          )}
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging ID
            </label>
            <input
              name="id"
              value={formData.id}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WO Number
            </label>
            <input
              name="woNumber"
              value={formData.woNumber}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SO Number
            </label>
            <input
              name="soNumber"
              value={formData.soNumber}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              name="clientName"
              value={formData.clientName}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QC Status
            </label>
            <input
              name="qcStatus"
              value={formData.qcStatus}
              readOnly
              className="w-full px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QC Approved By
            </label>
            <input
              name="qcApprovedBy"
              value={formData.qcApprovedBy}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QC Approval Date
            </label>
            <input
              name="qcApprovedDate"
              value={formData.qcApprovedDate}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={formData.status === "Completed"}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Dispatch
            </label>
            <input
              type="date"
              name="expectedDispatch"
              value={formData.expectedDispatch}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={formData.status === "Completed"}
            />
          </div>
        </div>

        {/* Packaging Team & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Team <span className="text-red-500">*</span>
            </label>
            <input
              name="packagingTeam"
              placeholder="Enter team name / member names"
              value={formData.packagingTeam}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={formData.status === "Completed"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packed Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="packedQty"
              placeholder="Enter packed quantity"
              value={formData.packedQty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={formData.status === "Completed"}
              min="1"
              required
            />
          </div>
        </div>

        {/* Mandatory Photo Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Mandatory Packaging Photos
            <span className="text-xs text-red-500 font-normal">
              (3 photos required)
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Final Product Photo */}
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Product <span className="text-red-500">*</span>
              </label>

              {!formData.photographs.final ? (
                <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 mb-1">
                      Click to upload
                    </span>
                    <span className="text-xs text-gray-400">
                      JPG, PNG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload("final", e)}
                      className="hidden"
                      disabled={formData.status === "Completed"}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.photographs.final.data}
                    alt="Final Product"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => handleRemovePhoto("final")}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    disabled={formData.status === "Completed"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {formData.photographs.final.name}
                  </p>
                </div>
              )}
              {photoErrors.final && (
                <p className="text-xs text-red-500 mt-1">{photoErrors.final}</p>
              )}
            </div>

            {/* During Packaging Photo */}
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                During Packaging <span className="text-red-500">*</span>
              </label>

              {!formData.photographs.during ? (
                <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 mb-1">
                      Click to upload
                    </span>
                    <span className="text-xs text-gray-400">
                      JPG, PNG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload("during", e)}
                      className="hidden"
                      disabled={formData.status === "Completed"}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.photographs.during.data}
                    alt="During Packaging"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => handleRemovePhoto("during")}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    disabled={formData.status === "Completed"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {formData.photographs.during.name}
                  </p>
                </div>
              )}
              {photoErrors.during && (
                <p className="text-xs text-red-500 mt-1">
                  {photoErrors.during}
                </p>
              )}
            </div>

            {/* After Packaging Photo */}
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                After Packaging <span className="text-red-500">*</span>
              </label>

              {!formData.photographs.after ? (
                <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 mb-1">
                      Click to upload
                    </span>
                    <span className="text-xs text-gray-400">
                      JPG, PNG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload("after", e)}
                      className="hidden"
                      disabled={formData.status === "Completed"}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={formData.photographs.after.data}
                    alt="After Packaging"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => handleRemovePhoto("after")}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    disabled={formData.status === "Completed"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {formData.photographs.after.name}
                  </p>
                </div>
              )}
              {photoErrors.after && (
                <p className="text-xs text-red-500 mt-1">{photoErrors.after}</p>
              )}
            </div>
          </div>

          {/* Photo Upload Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Upload Status:
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 text-xs ${formData.photographs.final ? "text-green-600" : "text-red-600"}`}
                >
                  {formData.photographs.final ? "✓" : "○"} Final
                </span>
                <span
                  className={`flex items-center gap-1 text-xs ${formData.photographs.during ? "text-green-600" : "text-red-600"}`}
                >
                  {formData.photographs.during ? "✓" : "○"} During
                </span>
                <span
                  className={`flex items-center gap-1 text-xs ${formData.photographs.after ? "text-green-600" : "text-red-600"}`}
                >
                  {formData.photographs.after ? "✓" : "○"} After
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photograph Remarks / Notes
          </label>
          <textarea
            name="photographRemarks"
            rows="3"
            placeholder="Enter any additional notes about the packaging or photographs..."
            value={formData.photographRemarks || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={formData.status === "Completed"}
          />
        </div>

        {/* Packaging Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Date
            </label>
            <input
              type="date"
              name="packagingDate"
              value={formData.packagingDate}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Time
            </label>
            <input
              type="text"
              name="packagingTime"
              value={formData.packagingTime}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Completion Status */}
        {formData.isCompleted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700">
                  Packaging Completed
                </p>
                <p className="text-xs text-green-600">
                  Completed on:{" "}
                  {new Date(formData.completedAt).toLocaleString()}
                </p>
                {formData.notificationsSent && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Notifications sent to Sales and Admin
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => navigate("/packaging")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          {formData.status !== "Completed" && (
            <>
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Draft
              </button>

              <button
                onClick={handleConfirmPackaging}
                disabled={
                  !allPhotosUploaded() ||
                  !formData.packagingTeam ||
                  !formData.packedQty
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Packaging Completion
              </button>
            </>
          )}

          {formData.status === "Completed" && (
            <button
              onClick={() => navigate("/packaging")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to List
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditPackaging;
