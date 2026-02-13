import { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, UserCog, Trash2, Plus, X, Edit2, Save, Search, ChevronDown, ChevronUp } from 'lucide-react';

const RolePermissions = () => {
  // Move modules and permissionTypes outside component or memoize them
  const MODULES = useMemo(() => [
    'Dashboard',
    'Sales Order', 
    'Work Orders',
    'Dispatch',
    'Customer Feedback',
    'User Management',
    'Role Management',
  ], []);

  const PERMISSION_TYPES = useMemo(() => [
    { key: 'access', label: 'Access' },
    { key: 'create', label: 'Create' },
    { key: 'read', label: 'Read' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' },
  ], []);

  // Load initial data from localStorage or defaults
  const loadInitialData = useCallback(() => {
    const storedRoles = localStorage.getItem('rolePermissionsRoles');
    const storedPermissions = localStorage.getItem('rolePermissionsData');
    
    if (storedRoles && storedPermissions) {
      return {
        roles: JSON.parse(storedRoles),
        permissions: JSON.parse(storedPermissions)
      };
    }
    
    return {
      roles: [
        {
          id: 1,
          name: 'ADMIN',
          description: 'Full system access with authority to manage users, roles, permissions, master data, reports, and overall system configuration.',
          userCount: 3,
          createdAt: '2024-01-15',
          isSystem: true
        },
        {
          id: 2,
          name: 'SALES',
          description: 'Handles customer inquiries, quotations, order creation, order tracking, invoicing coordination, and customer relationship management.',
          userCount: 5,
          createdAt: '2024-01-20',
          isSystem: false
        },
        {
          id: 3,
          name: 'PRODUCTION INCHARGE',
          description: 'Oversees production planning, work order execution, resource allocation, production schedules, and ensures timely manufacturing.',
          userCount: 4,
          createdAt: '2024-01-22',
          isSystem: false
        },
        {
          id: 4,
          name: 'QC',
          description: 'Responsible for quality inspection, testing, compliance checks, defect reporting, and approval or rejection of finished and in-process goods.',
          userCount: 6,
          createdAt: '2024-01-25',
          isSystem: false
        },
        {
          id: 5,
          name: 'PACKAGING',
          description: 'Manages packing operations, labeling, packing material usage, and ensures products are packed correctly for dispatch according to standards.',
          userCount: 8,
          createdAt: '2024-01-28',
          isSystem: false
        },
      ],
      permissions: {
        'ADMIN': {
          Dashboard: { access: true, create: true, read: true, update: true, delete: true },
          'Sales Order': { access: true, create: true, read: true, update: true, delete: true },
          'Work Orders': { access: true, create: true, read: true, update: true, delete: true },
          Dispatch: { access: true, create: true, read: true, update: true, delete: true },
          'Customer Feedback': { access: true, create: true, read: true, update: true, delete: true },
          Reports: { access: true, create: true, read: true, update: true, delete: true },
          'User Management': { access: true, create: true, read: true, update: true, delete: true },
          'Role Management': { access: true, create: true, read: true, update: true, delete: true },
        },
        'SALES': {
          Dashboard: { access: true, create: false, read: true, update: false, delete: false },
          'Sales Order': { access: true, create: true, read: true, update: true, delete: false },
          'Work Orders': { access: true, create: false, read: true, update: false, delete: false },
          Dispatch: { access: true, create: false, read: true, update: true, delete: false },
          'Customer Feedback': { access: true, create: true, read: true, update: true, delete: false },
          Reports: { access: true, create: false, read: true, update: false, delete: false },
          'User Management': { access: false, create: false, read: false, update: false, delete: false },
          'Role Management': { access: false, create: false, read: false, update: false, delete: false },
        },
        'PRODUCTION INCHARGE': {
          Dashboard: { access: true, create: false, read: true, update: false, delete: false },
          'Sales Order': { access: true, create: false, read: true, update: false, delete: false },
          'Work Orders': { access: true, create: true, read: true, update: true, delete: false },
          Dispatch: { access: true, create: false, read: true, update: false, delete: false },
          'Customer Feedback': { access: false, create: false, read: true, update: false, delete: false },
          Reports: { access: true, create: false, read: true, update: false, delete: false },
          'User Management': { access: false, create: false, read: false, update: false, delete: false },
          'Role Management': { access: false, create: false, read: false, update: false, delete: false },
        },
        'QC': {
          Dashboard: { access: true, create: false, read: true, update: false, delete: false },
          'Sales Order': { access: false, create: false, read: false, update: false, delete: false },
          'Work Orders': { access: true, create: false, read: true, update: true, delete: false },
          Dispatch: { access: true, create: false, read: true, update: false, delete: false },
          'Customer Feedback': { access: true, create: true, read: true, update: true, delete: false },
          Reports: { access: true, create: false, read: true, update: false, delete: false },
          'User Management': { access: false, create: false, read: false, update: false, delete: false },
          'Role Management': { access: false, create: false, read: false, update: false, delete: false },
        },
        'PACKAGING': {
          Dashboard: { access: true, create: false, read: true, update: false, delete: false },
          'Sales Order': { access: false, create: false, read: false, update: false, delete: false },
          'Work Orders': { access: true, create: false, read: true, update: false, delete: false },
          Dispatch: { access: true, create: true, read: true, update: true, delete: false },
          'Customer Feedback': { access: false, create: false, read: false, update: false, delete: false },
          Reports: { access: true, create: false, read: true, update: false, delete: false },
          'User Management': { access: false, create: false, read: false, update: false, delete: false },
          'Role Management': { access: false, create: false, read: false, update: false, delete: false },
        }
      }
    };
  }, []);

  // State management
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRole, setExpandedRole] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {}
  });

  // Initialize empty permissions structure
  const getEmptyPermissions = useCallback(() => {
    const initialFormPermissions = {};
    MODULES.forEach(module => {
      initialFormPermissions[module] = {};
      PERMISSION_TYPES.forEach(perm => {
        initialFormPermissions[module][perm.key] = false;
      });
    });
    return initialFormPermissions;
  }, [MODULES, PERMISSION_TYPES]);

  // Initialize data
  useEffect(() => {
    const { roles: initialRoles, permissions: initialPermissions } = loadInitialData();
    setRoles(initialRoles);
    setPermissions(initialPermissions);
    
    // Initialize form permissions structure
    setFormData(prev => ({
      ...prev,
      permissions: getEmptyPermissions()
    }));
  }, [loadInitialData, getEmptyPermissions]);

  // Save to localStorage
  useEffect(() => {
    if (roles.length > 0) {
      localStorage.setItem('rolePermissionsRoles', JSON.stringify(roles));
    }
  }, [roles]);

  useEffect(() => {
    if (Object.keys(permissions).length > 0) {
      localStorage.setItem('rolePermissionsData', JSON.stringify(permissions));
    }
  }, [permissions]);

  // Filter roles based on search
  const filteredRoles = useMemo(() => 
    roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    ), [roles, searchTerm]
  );

  // Generate new ID
  const generateId = useCallback(() => {
    return roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
  }, [roles]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      permissions: getEmptyPermissions()
    });
    setEditingRoleId(null);
  }, [getEmptyPermissions]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowAddRoleModal(false);
    setShowViewModal(false);
    resetForm();
  }, [resetForm]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingRoleId) {
      // Update existing role
      const updatedRoles = roles.map(role => 
        role.id === editingRoleId 
          ? {
              ...role,
              name: formData.name,
              description: formData.description
            }
          : role
      );
      
      // Update permissions for this role
      const updatedPermissions = {
        ...permissions,
        [formData.name]: formData.permissions
      };
      
      setRoles(updatedRoles);
      setPermissions(updatedPermissions);
    } else {
      // Create new role
      const newRole = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        isSystem: false
      };
      
      // Add permissions for new role
      const newPermissions = {
        ...permissions,
        [formData.name]: formData.permissions
      };
      
      setRoles([...roles, newRole]);
      setPermissions(newPermissions);
    }
    
    handleModalClose();
  };

  // Handle edit role
  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: permissions[role.name] || getEmptyPermissions()
    });
    setEditingRoleId(role.id);
    setShowAddRoleModal(true);
  };

  // Handle delete role
  const handleDelete = (id) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete?.isSystem) {
      alert('System roles cannot be deleted');
      return;
    }
    
    const updatedRoles = roles.filter(role => role.id !== id);
    const updatedPermissions = { ...permissions };
    delete updatedPermissions[roleToDelete.name];
    
    setRoles(updatedRoles);
    setPermissions(updatedPermissions);
    setDeleteConfirmId(null);
  };

  // Handle permission change
  const handlePermissionChange = (module, permissionType, value = null) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [permissionType]: value !== null ? value : !prev.permissions[module]?.[permissionType]
        }
      }
    }));
  };

  // Handle select/deselect all for a module
  const handleSelectAllModule = (module, selectAll) => {
    setFormData(prev => {
      const updatedPermissions = { ...prev.permissions };
      
      if (selectAll) {
        PERMISSION_TYPES.forEach(perm => {
          if (!updatedPermissions[module]) updatedPermissions[module] = {};
          updatedPermissions[module][perm.key] = true;
        });
      } else {
        PERMISSION_TYPES.forEach(perm => {
          if (updatedPermissions[module]) {
            updatedPermissions[module][perm.key] = false;
          }
        });
      }
      
      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  // Handle select/deselect all permissions
  const handleSelectAllPermissions = (selectAll) => {
    setFormData(prev => {
      const updatedPermissions = {};
      
      MODULES.forEach(module => {
        updatedPermissions[module] = {};
        PERMISSION_TYPES.forEach(perm => {
          updatedPermissions[module][perm.key] = selectAll;
        });
      });
      
      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  // View role details
  const viewRole = (role) => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: permissions[role.name] || getEmptyPermissions()
    });
    setShowViewModal(true);
  };

  // Get permission count for a role
  const getPermissionCount = useCallback((roleName) => {
    if (!permissions[roleName]) return 0;
    let count = 0;
    Object.values(permissions[roleName]).forEach(modulePerms => {
      Object.values(modulePerms).forEach(value => {
        if (value) count++;
      });
    });
    return count;
  }, [permissions]);

  // Toggle expanded role
  const toggleExpandedRole = (roleId) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permissions Management</h1>
          <p className="text-gray-600 mt-1">Manage system roles and their access permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddRoleModal(true);
          }}
          className="bg-brand-red hover:bg-red-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add New Role
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    {role.isSystem && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Users: {role.userCount}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleExpandedRole(role.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    {expandedRole === role.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {expandedRole === role.id && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-3">{role.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Permissions: {getPermissionCount(role.name)}</span>
                    <span className="mx-1">•</span>
                    <span>Created: {role.createdAt}</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-700 line-clamp-2">{role.description}</p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{getPermissionCount(role.name)}</span> permissions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewRole(role)}
                    className="text-gray-600 hover:text-gray-900 transition p-1.5 rounded hover:bg-gray-100"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-gray-600 hover:text-gray-900 transition p-1.5 rounded hover:bg-gray-100"
                    title="Edit Role"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(role.id)}
                    disabled={role.isSystem}
                    className={`transition p-1.5 rounded ${
                      role.isSystem 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                    }`}
                    title={role.isSystem ? "System roles cannot be deleted" : "Delete Role"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No roles message */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserCog className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roles Found</h3>
          <p className="text-gray-600 mb-6">Create your first role to get started</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddRoleModal(true);
            }}
            className="bg-brand-red hover:bg-red-800 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Role
          </button>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRoleId ? 'Edit Role' : 'Add New Role'}
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Store Manager"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    required
                    disabled={editingRoleId}
                  />
                  <p className="text-xs text-gray-500 mt-1">Role names are automatically converted to uppercase</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Description
                  </label>
                  <textarea
                    placeholder="Describe the role responsibilities and purpose..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
              </div>

              {/* Permissions Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                    <p className="text-sm text-gray-600">Configure access permissions for this role</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllPermissions(true)}
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllPermissions(false)}
                      className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Permissions Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 w-48">
                            Module
                          </th>
                          {PERMISSION_TYPES.map((perm) => (
                            <th key={perm.key} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              {perm.label}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-l border-gray-200">
                            All
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {MODULES.map((module) => (
                          <tr key={module} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-r border-gray-200">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[module]?.access || false}
                                  onChange={() => handlePermissionChange(module, 'access')}
                                  className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                                />
                                <span className="text-sm font-medium text-gray-900">{module}</span>
                              </label>
                            </td>
                            {PERMISSION_TYPES.map((perm) => (
                              <td key={perm.key} className="px-4 py-3 text-center border-r border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[module]?.[perm.key] || false}
                                  onChange={() => handlePermissionChange(module, perm.key)}
                                  disabled={perm.key === 'access' ? false : !formData.permissions[module]?.access}
                                  className={`w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red ${
                                    perm.key !== 'access' && !formData.permissions[module]?.access 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : ''
                                  }`}
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={PERMISSION_TYPES.every(perm => formData.permissions[module]?.[perm.key])}
                                onChange={(e) => handleSelectAllModule(module, e.target.checked)}
                                className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
                  {editingRoleId ? (
                    <>
                      <Save className="w-4 h-4" />
                      Update Role
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Role Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Role Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {getPermissionCount(formData.name)} Permissions
                  </span>
                </div>
                <p className="text-gray-700">{formData.description}</p>
              </div>

              {/* Permissions Summary */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MODULES
                    .filter(module => formData.permissions[module]?.access)
                    .map((module) => (
                      <div key={module} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">{module}</h5>
                          <span className="text-xs text-gray-600">
                            {Object.values(formData.permissions[module] || {}).filter(v => v).length} permissions
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PERMISSION_TYPES
                            .filter(perm => formData.permissions[module]?.[perm.key])
                            .map((perm) => (
                              <span
                                key={perm.key}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
                              >
                                {perm.label}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
                
                {!MODULES.some(module => formData.permissions[module]?.access) && (
                  <div className="text-center py-8 text-gray-500">
                    No permissions assigned to this role
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 bg-brand-red text-white rounded-lg hover:bg-red-800 transition"
              >
                Close
              </button>
            </div>
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
                Delete Role
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this role? Users assigned to this role will lose their permissions.
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
                  Delete Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissions;