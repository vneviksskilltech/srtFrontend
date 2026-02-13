import { useState, useEffect } from 'react';
import { Eye, Trash2, Plus, X, Edit2, Save } from 'lucide-react';

const UserManagement = () => {
  // Load users from localStorage or use initial data
  const loadUsersFromStorage = () => {
    const storedUsers = localStorage.getItem('userManagementUsers');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    return [
      { id: 1, name: 'Rahul Sharma', email: 'rahul@company.com', role: 'Admin', active: true, lastLogin: '2 hours ago' },
      { id: 2, name: 'Amit Patel', email: 'amit.patel@company.com', role: 'Production', active: true, lastLogin: '1 hours ago' },
      { id: 3, name: 'Neha Verme', email: 'neha.verma@company.com', role: 'Production', active: false, lastLogin: '2 hours ago' },
      { id: 4, name: 'Rakesh Mehta', email: 'rakesh.mehta@company.com', role: 'QC', active: true, lastLogin: '2 day ago' },
      { id: 5, name: 'Pooja Nair', email: 'pooja.nair@company.com', role: 'Packaging', active: true, lastLogin: '20 mins ago' },
      { id: 6, name: 'Suresh Kumar', email: 'suresh.kumar@company.com', role: 'Sales', active: true, lastLogin: '1 hours ago' },
      { id: 7, name: 'Priya Singh', email: 'priya.singh@company.com', role: 'Production', active: false, lastLogin: '3 days ago' },
      { id: 8, name: 'Vikram Joshi', email: 'vikram.joshi@company.com', role: 'QC', active: true, lastLogin: '5 hours ago' },
      { id: 9, name: 'Anjali Desai', email: 'anjali.desai@company.com', role: 'Packaging', active: false, lastLogin: '1 week ago' },
      { id: 10, name: 'Rajesh Gupta', email: 'rajesh.gupta@company.com', role: 'Sales', active: false, lastLogin: '2 days ago' },
      { id: 11, name: 'Meera Iyer', email: 'meera.iyer@company.com', role: 'Admin', active: true, lastLogin: '1 hour ago' },
      { id: 12, name: 'Karan Malhotra', email: 'karan.malhotra@company.com', role: 'Production', active: true, lastLogin: '30 mins ago' },
    ];
  };

  // State management
  const [users, setUsers] = useState(loadUsersFromStorage());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Admin',
    active: true
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Save to localStorage whenever users change
  useEffect(() => {
    localStorage.setItem('userManagementUsers', JSON.stringify(users));
  }, [users]);

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    if (statusFilter === 'active') return user.active;
    if (statusFilter === 'inactive') return !user.active;
    return true;
  }).filter(user => {
    if (roleFilter === 'all') return true;
    return user.role === roleFilter;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'role') return a.role.localeCompare(b.role);
    if (sortBy === 'active') return b.active - a.active;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const getRoleBadgeClass = (role) => {
    const classes = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Production': 'bg-blue-100 text-blue-800',
      'QC': 'bg-yellow-100 text-yellow-800',
      'Packaging': 'bg-green-100 text-green-800',
      'Sales': 'bg-red-100 text-red-800',
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${classes[role] || 'bg-gray-100 text-gray-800'}`;
  };

  // Generate unique ID
  const generateId = () => {
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  };

  // Handle form submission for create/update
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUserId) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUserId 
          ? {
              ...user,
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              role: formData.role,
              active: formData.active
            }
          : user
      ));
      setEditingUserId(null);
    } else {
      // Create new user
      const newUser = {
        id: generateId(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        role: formData.role,
        active: formData.active,
        lastLogin: 'Just now'
      };
      setUsers([...users, newUser]);
    }
    
    setShowCreateModal(false);
    resetForm();
  };

  // Handle edit user
  const handleEdit = (user) => {
    const [firstName, ...lastNameParts] = user.name.split(' ');
    setFormData({
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: user.email,
      role: user.role,
      active: user.active
    });
    setEditingUserId(user.id);
    setShowCreateModal(true);
  };

  // Handle delete user
  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
    setDeleteConfirmId(null);
  };

  // Handle toggle active status
  const handleToggleActive = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Admin',
      active: true
    });
    setEditingUserId(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowCreateModal(false);
    resetForm();
  };

  // View user details
  const viewUser = (user) => {
    setViewingUserId(user.id);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          {/* <p className="text-gray-600 mt-1">Total Users: {users.length} | Showing: {currentUsers.length}</p> */}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-red hover:bg-red-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-200">
          {/* <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2> */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select 
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Production">Production</option>
              <option value="QC">QC</option>
              <option value="Packaging">Packaging</option>
              <option value="Sales">Sales</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="role">Sort by Role</option>
              <option value="active">Sort by Status</option>
            </select>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-red focus:border-transparent"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 ${user.active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.active ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                    <span className="ml-2 text-sm text-gray-700">
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewUser(user)}
                        className="text-gray-600 hover:text-gray-900 transition p-1 rounded hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-gray-600 hover:text-gray-900 transition p-1 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(user.id)}
                        className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No users message */}
          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredUsers.length)}
              </span>{' '}
              of <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1.5 text-sm rounded ${
                    currentPage === number
                      ? 'bg-brand-red text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUserId ? 'Edit User' : 'Create User'}
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Production">Production</option>
                    <option value="QC">QC</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`block w-11 h-6 rounded-full transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform transform ${formData.active ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active User</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">Inactive users cannot access the system</p>
              </div>

              <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-red text-white rounded-lg hover:bg-red-800 transition flex items-center gap-2"
                >
                  {editingUserId ? (
                    <>
                      <Save className="w-4 h-4" />
                      Update User
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete User
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setViewingUserId(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const user = users.find(u => u.id === viewingUserId);
                if (!user) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-gray-900">{user.lastLogin}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingUserId(null)}
                className="px-6 py-2.5 bg-brand-red text-white rounded-lg hover:bg-red-800 transition"
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

export default UserManagement;