import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Trash2, Search, Calendar } from 'lucide-react';

const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const orderItems = [
    { code: 'ITEM-01', description: 'Machine Component A', qty: 2, unit: 'Nos', remarks: 'As per drawing' },
    { code: 'ITEM-02', description: 'Custom Assembly', qty: 1, unit: 'Set', remarks: 'Red finish' },
    { code: 'ITEM-02', description: 'Custom Assembly', qty: 1, unit: 'Set', remarks: 'Red finish' },
    { code: 'ITEM-02', description: 'Custom Assembly', qty: 1, unit: 'Set', remarks: 'Red finish' },
    { code: 'ITEM-02', description: 'Custom Assembly', qty: 1, unit: 'Set', remarks: 'Red finish' },
  ];

  const files = [
    { name: 'Customer_Drawing_v2.pdf', icon: '📄' },
    { name: 'Specification_Sheet.pdf', icon: '📄' },
    { name: 'Specification_Sheet.pdf', icon: '📄' },
    { name: 'Reference_Image.pdf', icon: '📄' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/sales-orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Prime Manufacturing</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-600">Status: <span className="font-medium text-green-600">WO Generated</span></span>
            <span className="text-sm text-gray-600">WO: <span className="font-medium text-blue-600">Linked</span></span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-100 mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="SO Number"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Client"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="01/01/2025 - 01/01/2026"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red">
            <option>Status</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red">
            <option>Assigned Sales</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Client & Shipping Details */}
        <div className="space-y-6">
          {/* Client Details */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">CLIENT DETAILS</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Company Name:</p>
                <p className="text-sm font-medium text-gray-900">Prime Manufacturing</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">GST Number:</p>
                <p className="text-sm font-medium text-gray-900">27AABCP1234F1Z5</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Person:</p>
                <p className="text-sm font-medium text-gray-900">Rohan Mehta</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone:</p>
                <p className="text-sm font-medium text-gray-900">+91 98765 43210</p>
              </div>

            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SHIPPING DETAILS</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Shipping Address:</p>
                <p className="text-sm font-medium text-gray-900">
                  Plot No. 42, Industrial Estate, Andheri (East), Mumbai, Maharashtra, 400093
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Delivery Contact:</p>
                <p className="text-sm font-medium text-gray-900">Amit Kulkarni</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone:</p>
                <p className="text-sm font-medium text-gray-900">+91 91234 56789</p>
              </div>
            </div>
          </div>

          {/* SO Summary */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SO SUMMARY</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sales Order:</span>
                <span className="text-sm font-medium text-gray-900">#SO-2047</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Value:</span>
                <span className="text-sm font-medium text-gray-900">₹6,90,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Date:</span>
                <span className="text-sm font-medium text-gray-900">14 Jun 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expected Delivery:</span>
                <span className="text-sm font-medium text-gray-900">10 Jul 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Items & Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Files & Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Files */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{file.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-600 hover:text-gray-900 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commercial & Pricing */}
            <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">COMMERCIAL & PRICING DETAILS</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base Amount:</span>
                  <span className="text-sm font-medium text-gray-900">₹5,85,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">GST (18%):</span>
                  <span className="text-sm font-medium text-gray-900">₹1,05,300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-red-600">₹0</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Total Order Value:</span>
                  <span className="text-sm font-bold text-gray-900">₹6,90,300</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Advance Received:</span>
                  <span className="text-sm font-medium text-green-600">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetails;
