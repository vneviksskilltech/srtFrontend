import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Star,
  MessageCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";

const CustomerFeedback = () => {
  const [search, setSearch] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [dispatchRecords, setDispatchRecords] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // all, pending, completed
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    pendingFollowUps: 0,
    completedFollowUps: 0,
    satisfactionRate: 0,
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    id: "",
    soNumber: "",
    woNumber: "",
    dispatchId: "",
    clientName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    deliveryDate: "",
    followUps: [
      {
        id: 1,
        stage: "15-Day Follow-up",
        dueDate: "",
        status: "pending",
        rating: null,
        remarks: "",
        feedbackDate: null,
        feedbackBy: "",
        category: "",
        completedAt: null,
      },
      {
        id: 2,
        stage: "30-Day Follow-up",
        dueDate: "",
        status: "pending",
        rating: null,
        remarks: "",
        feedbackDate: null,
        feedbackBy: "",
        category: "",
        completedAt: null,
      },
      {
        id: 3,
        stage: "60-Day Follow-up",
        dueDate: "",
        status: "pending",
        rating: null,
        remarks: "",
        feedbackDate: null,
        feedbackBy: "",
        category: "",
        completedAt: null,
      },
    ],
    overallSatisfaction: null,
    createdAt: "",
    updatedAt: "",
  });

  // Load data from localStorage
  const loadData = useCallback(() => {
    const storedFeedbacks =
      JSON.parse(localStorage.getItem("customerFeedbacks")) || [];

    const storedDispatch =
      JSON.parse(localStorage.getItem("dispatchRecords")) || [];

    const deliveredDispatch = storedDispatch.filter(
      (d) => d.status === "Delivered" || d.deliveredAt,
    );

    const formattedFeedbacks = storedFeedbacks.map((feedback) => ({
      ...feedback,
      followUps: feedback.followUps || [],
      overallSatisfaction:
        feedback.overallSatisfaction ||
        calculateOverallSatisfaction(feedback.followUps),
    }));

    setFeedbacks(formattedFeedbacks);
    setDispatchRecords(deliveredDispatch);
    calculateStats(formattedFeedbacks);
  }, []); // Add dependencies here if any (calculateStats, etc.)

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate due date for follow-ups
  const calculateDueDate = (deliveryDate, days) => {
    if (!deliveryDate) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString().split("T")[0];
    }
    const date = new Date(deliveryDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  // Calculate overall satisfaction from follow-ups
  const calculateOverallSatisfaction = (followUps) => {
    if (!followUps) return null;
    const ratings = followUps
      .filter((f) => f.rating !== null && f.rating > 0)
      .map((f) => f.rating);

    if (ratings.length === 0) return null;
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.round(average * 10) / 10;
  };

  // Calculate statistics
  const calculateStats = (feedbackData) => {
    let totalRatings = 0;
    let ratingCount = 0;
    let pendingCount = 0;
    let completedCount = 0;

    feedbackData.forEach((feedback) => {
      feedback.followUps.forEach((followUp) => {
        if (followUp.rating) {
          totalRatings += followUp.rating;
          ratingCount++;
        }
        if (followUp.status === "completed") {
          completedCount++;
        } else if (
          followUp.status === "pending" ||
          followUp.status === "overdue"
        ) {
          pendingCount++;
        }
      });
    });

    setStats({
      totalFeedbacks: feedbackData.length,
      averageRating:
        ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : 0,
      pendingFollowUps: pendingCount,
      completedFollowUps: completedCount,
      satisfactionRate:
        ratingCount > 0 ? ((totalRatings / ratingCount) * 20).toFixed(0) : 0,
    });
  };

  // Handle select delivered product for feedback
  const handleSelectDeliveredProduct = (dispatchId) => {
    const dispatch = dispatchRecords.find((d) => d.id === dispatchId);
    if (!dispatch) return;

    const deliveryDate =
      dispatch.deliveredDate ||
      dispatch.dispatchDate ||
      new Date().toISOString().split("T")[0];

    setSelectedDispatch(dispatch);
    setFeedbackForm({
      id: `FB-${Date.now().toString().slice(-6)}`,
      soNumber: dispatch.soNumber || "",
      woNumber: dispatch.woNumber || "",
      dispatchId: dispatch.id,
      clientName: dispatch.clientName || "",
      contactPerson: dispatch.contactPerson || "",
      contactEmail: "",
      contactPhone: dispatch.contactPhone || "",
      deliveryDate: deliveryDate,
      followUps: [
        {
          id: 1,
          stage: "15-Day Follow-up",
          dueDate: calculateDueDate(deliveryDate, 15),
          status: "pending",
          rating: null,
          remarks: "",
          feedbackDate: null,
          feedbackBy: "",
          category: "",
          completedAt: null,
        },
        {
          id: 2,
          stage: "30-Day Follow-up",
          dueDate: calculateDueDate(deliveryDate, 30),
          status: "pending",
          rating: null,
          remarks: "",
          feedbackDate: null,
          feedbackBy: "",
          category: "",
          completedAt: null,
        },
        {
          id: 3,
          stage: "60-Day Follow-up",
          dueDate: calculateDueDate(deliveryDate, 60),
          status: "pending",
          rating: null,
          remarks: "",
          feedbackDate: null,
          feedbackBy: "",
          category: "",
          completedAt: null,
        },
      ],
      overallSatisfaction: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setShowFeedbackForm(true);
  };

  // Handle feedback submission for a specific follow-up
  const handleSubmitFollowUp = (followUpIndex) => {
    const followUp = feedbackForm.followUps[followUpIndex];

    if (!followUp.rating) {
      alert("Please provide a rating (1-5 stars)");
      return;
    }

    if (!followUp.remarks.trim()) {
      alert("Please enter feedback remarks");
      return;
    }

    if (!followUp.feedbackBy.trim()) {
      alert("Please enter your name");
      return;
    }

    const updatedFollowUps = [...feedbackForm.followUps];
    updatedFollowUps[followUpIndex] = {
      ...followUp,
      status: "completed",
      feedbackDate: new Date().toISOString().split("T")[0],
      feedbackTime: new Date().toLocaleTimeString(),
      completedAt: new Date().toISOString(),
    };

    const updatedFeedback = {
      ...feedbackForm,
      followUps: updatedFollowUps,
      overallSatisfaction: calculateOverallSatisfaction(updatedFollowUps),
      updatedAt: new Date().toISOString(),
    };

    setFeedbackForm(updatedFeedback);

    // Auto-save to localStorage
    saveFeedback(updatedFeedback);
  };

  // Save feedback to localStorage
  const saveFeedback = (feedbackData) => {
    const stored = JSON.parse(localStorage.getItem("customerFeedbacks")) || [];

    // Check if feedback already exists
    const existingIndex = stored.findIndex((f) => f.id === feedbackData.id);

    if (existingIndex >= 0) {
      stored[existingIndex] = feedbackData;
    } else {
      stored.push(feedbackData);
    }

    localStorage.setItem("customerFeedbacks", JSON.stringify(stored));
    setFeedbacks(stored);
    calculateStats(stored);
  };

  // Complete all follow-ups and finalize feedback
  const handleCompleteFeedback = () => {
    const allCompleted = feedbackForm.followUps.every(
      (f) => f.status === "completed",
    );

    if (!allCompleted) {
      alert("Please complete all follow-up stages before finalizing");
      return;
    }

    const finalFeedback = {
      ...feedbackForm,
      finalizedAt: new Date().toISOString(),
    };

    saveFeedback(finalFeedback);
    setShowFeedbackForm(false);
    setSelectedDispatch(null);
    alert("✅ Customer feedback completed successfully!");
  };

  // Handle follow-up form change
  const handleFollowUpChange = (index, field, value) => {
    const updatedFollowUps = [...feedbackForm.followUps];
    updatedFollowUps[index] = {
      ...updatedFollowUps[index],
      [field]: value,
    };
    setFeedbackForm({
      ...feedbackForm,
      followUps: updatedFollowUps,
    });
  };
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  // View feedback details
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  // Get follow-up status color
  const getFollowUpStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
      skipped: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Get rating stars
  const renderStars = (rating) => {
    if (!rating) return "Not rated";
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Check if follow-up is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      (feedback.clientName || "").toLowerCase().includes(searchTerm) ||
      (feedback.soNumber || "").toLowerCase().includes(searchTerm) ||
      (feedback.woNumber || "").toLowerCase().includes(searchTerm);

    let matchesStatus = true;
    if (viewMode === "pending") {
      matchesStatus = feedback.followUps.some(
        (f) => f.status === "pending" || f.status === "overdue",
      );
    } else if (viewMode === "completed") {
      matchesStatus = feedback.followUps.every((f) => f.status === "completed");
    }

    let matchesFollowUp = true;
    if (followUpFilter) {
      matchesFollowUp = feedback.followUps.some(
        (f) => f.stage.includes(followUpFilter) && f.status === "pending",
      );
    }

    return matchesSearch && matchesStatus && matchesFollowUp;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Feedback Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            15-Day • 30-Day • 60-Day Follow-up Schedule
          </p>
        </div>

        <div className="flex gap-3">
          {dispatchRecords.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => handleSelectDeliveredProduct(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                defaultValue=""
              >
                <option value="" disabled>
                  Start New Feedback
                </option>
                {dispatchRecords.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.soNumber} - {d.clientName} (Delivered:{" "}
                    {d.deliveredDate || d.dispatchDate})
                  </option>
                ))}
              </select>
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {dispatchRecords.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Feedbacks</p>
              <p className="text-2xl font-bold text-gray-700">
                {stats.totalFeedbacks}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating}
                </p>
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-yellow-600 fill-current" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.satisfactionRate}%
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Follow-ups</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pendingFollowUps}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.completedFollowUps}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Client, SO, WO"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex-1 ${
                viewMode === "all"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode("pending")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex-1 ${
                viewMode === "pending"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setViewMode("completed")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex-1 ${
                viewMode === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>

          <select
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Follow-ups</option>
            <option value="15-Day">15-Day Due</option>
            <option value="30-Day">30-Day Due</option>
            <option value="60-Day">60-Day Due</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  SO/WO
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Client
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  15-Day
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  30-Day
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  60-Day
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Overall
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Delivery Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {feedback.soNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {feedback.woNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{feedback.clientName}</div>
                        {feedback.contactPerson && (
                          <div className="text-xs text-gray-500">
                            {feedback.contactPerson}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getFollowUpStatusColor(feedback.followUps[0].status)}`}
                        >
                          {feedback.followUps[0].status}
                        </span>
                        {feedback.followUps[0].rating && (
                          <span className="text-xs text-yellow-600">
                            {renderStars(feedback.followUps[0].rating)}
                          </span>
                        )}
                        {isOverdue(feedback.followUps[0].dueDate) &&
                          feedback.followUps[0].status === "pending" && (
                            <span className="text-xs text-red-600">
                              Overdue!
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getFollowUpStatusColor(feedback.followUps[1].status)}`}
                        >
                          {feedback.followUps[1].status}
                        </span>
                        {feedback.followUps[1].rating && (
                          <span className="text-xs text-yellow-600">
                            {renderStars(feedback.followUps[1].rating)}
                          </span>
                        )}
                        {isOverdue(feedback.followUps[1].dueDate) &&
                          feedback.followUps[1].status === "pending" && (
                            <span className="text-xs text-red-600">
                              Overdue!
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getFollowUpStatusColor(feedback.followUps[2].status)}`}
                        >
                          {feedback.followUps[2].status}
                        </span>
                        {feedback.followUps[2].rating && (
                          <span className="text-xs text-yellow-600">
                            {renderStars(feedback.followUps[2].rating)}
                          </span>
                        )}
                        {isOverdue(feedback.followUps[2].dueDate) &&
                          feedback.followUps[2].status === "pending" && (
                            <span className="text-xs text-red-600">
                              Overdue!
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {feedback.overallSatisfaction ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {feedback.overallSatisfaction}
                          </span>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div>{feedback.deliveryDate}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewFeedback(feedback)}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg">
                        No customer feedback records found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {search || viewMode !== "all"
                          ? "Try adjusting your filters"
                          : "Start collecting feedback from delivered orders"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && selectedDispatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Customer Feedback - Follow-up Schedule
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {feedbackForm.clientName} | SO: {feedbackForm.soNumber} |
                  Delivered: {feedbackForm.deliveryDate}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  setSelectedDispatch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={feedbackForm.contactPerson}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          contactPerson: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={feedbackForm.contactEmail}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          contactEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={feedbackForm.contactPhone}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          contactPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      placeholder="Contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Follow-up Stages */}
              <div className="space-y-6">
                {feedbackForm.followUps.map((followUp, index) => (
                  <div
                    key={followUp.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-red-600" />
                        {followUp.stage}
                      </h3>
                      {followUp.status === "completed" ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed on {followUp.feedbackDate}
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isOverdue(followUp.dueDate)
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          Due: {followUp.dueDate}
                        </span>
                      )}
                    </div>

                    {followUp.status === "completed" ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Rating</p>
                            <p className="text-lg">
                              {renderStars(followUp.rating)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="font-medium">
                              {followUp.category || "General"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">Remarks</p>
                            <p className="text-sm">{followUp.remarks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Feedback By</p>
                            <p className="text-sm">{followUp.feedbackBy}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Feedback Date
                            </p>
                            <p className="text-sm">
                              {followUp.feedbackDate} {followUp.feedbackTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Rating (1-5 Stars){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    handleFollowUpChange(index, "rating", star)
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    followUp.rating >= star
                                      ? "text-yellow-500"
                                      : "text-gray-300 hover:text-yellow-300"
                                  }`}
                                >
                                  <Star
                                    className={`w-6 h-6 ${followUp.rating >= star ? "fill-current" : ""}`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Category
                            </label>
                            <select
                              value={followUp.category}
                              onChange={(e) =>
                                handleFollowUpChange(
                                  index,
                                  "category",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">Select Category</option>
                              <option value="Product Quality">
                                Product Quality
                              </option>
                              <option value="Delivery">Delivery</option>
                              <option value="Packaging">Packaging</option>
                              <option value="Service">Service</option>
                              <option value="Price">Price</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Remarks / Complaints{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows="3"
                            value={followUp.remarks}
                            onChange={(e) =>
                              handleFollowUpChange(
                                index,
                                "remarks",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Please share your feedback, suggestions, or any issues..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Feedback Taken By{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={followUp.feedbackBy}
                              onChange={(e) =>
                                handleFollowUpChange(
                                  index,
                                  "feedbackBy",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Your name"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSubmitFollowUp(index)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete {followUp.stage}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Overall Satisfaction */}
              {feedbackForm.followUps.every(
                (f) => f.status === "completed",
              ) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">
                        All Follow-ups Completed!
                      </p>
                      <p className="text-sm text-green-600">
                        Overall Satisfaction:{" "}
                        {feedbackForm.overallSatisfaction || "Calculating..."}{" "}
                        ⭐
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  setSelectedDispatch(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              {feedbackForm.followUps.every((f) => f.status === "completed") ? (
                <button
                  onClick={handleCompleteFeedback}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finalize Feedback
                </button>
              ) : (
                <button
                  onClick={() => {
                    saveFeedback(feedbackForm);
                    alert("Progress saved successfully!");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Progress
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* View Feedback Modal */}
      {showViewModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Customer Feedback Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedFeedback.clientName} | SO:{" "}
                  {selectedFeedback.soNumber}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedFeedback(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {selectedFeedback.followUps.map((f, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">{f.stage}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        f.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>

                  {f.status === "completed" ? (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Rating:</strong> {renderStars(f.rating)}
                      </p>
                      <p>
                        <strong>Category:</strong> {f.category || "General"}
                      </p>
                      <p>
                        <strong>Remarks:</strong> {f.remarks}
                      </p>
                      <p>
                        <strong>Feedback By:</strong> {f.feedbackBy}
                      </p>
                      <p>
                        <strong>Date:</strong> {f.feedbackDate} {f.feedbackTime}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Not completed yet. Due on {f.dueDate}
                    </p>
                  )}
                </div>
              ))}

              {/* Overall */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">
                  Overall Satisfaction:{" "}
                  {selectedFeedback.overallSatisfaction
                    ? `${selectedFeedback.overallSatisfaction} ⭐`
                    : "Not rated yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedback;
