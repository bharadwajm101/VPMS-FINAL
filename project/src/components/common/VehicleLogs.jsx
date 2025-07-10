import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  Car, 
  User, 
  MapPin, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { vehicleLogService, userService } from '../../services/api';

const VehicleLogs = () => {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch data based on user role
      let logsData;
      if (user && user.role === 'CUSTOMER') {
        // Customers can only see their own logs
        logsData = await vehicleLogService.getUserLogs(user.id);
        setLogs(Array.isArray(logsData) ? logsData : []);
      } else {
        // Admin and Staff can see all logs
        const response = await vehicleLogService.getAllLogs();
        setLogs(response.logs || []);
      }
      
      // Fetch users for admin/staff to display user names
      if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load vehicle logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'Unknown';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getUserName(log.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.slotId.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && !log.exitTime) || 
                         (filterStatus === 'COMPLETED' && log.exitTime);
    
    const matchesType = filterType === 'ALL' || log.slotType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: logs.length,
    active: logs.filter(log => !log.exitTime).length,
    completed: logs.filter(log => log.exitTime).length,
    twoWheeler: logs.filter(log => log.slotType === '2W').length,
    fourWheeler: logs.filter(log => log.slotType === '4W').length,
  };

  const getStatusColor = (hasExitTime) => {
    return hasExitTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getTypeColor = (type) => {
    return type === '2W' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const calculateDuration = (entryTime, exitTime) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diffMs = exit.getTime() - entry.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Logs</h1>
            <p className="text-gray-600">
              {user && user.role === 'CUSTOMER' 
                ? 'Track your vehicle parking history and current status' 
                : 'Track all vehicle entry and exit activities'}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Logs</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Currently Parked</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed Visits</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.twoWheeler}</div>
          <div className="text-sm text-gray-600">2-Wheeler</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.fourWheeler}</div>
          <div className="text-sm text-gray-600">4-Wheeler</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by vehicle number, user name, or slot ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Currently Parked</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="2W">2-Wheeler</option>
          <option value="4W">4-Wheeler</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{log.vehicleNumber}</div>
                        <div className="text-sm text-gray-500">Log #{log.logId}</div>
                      </div>
                    </div>
                  </td>
                  {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getUserName(log.userId)}</div>
                      <div className="text-sm text-gray-500">{getUserEmail(log.userId)}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{log.slotId}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getTypeColor(log.slotType)}`}>
                        {log.slotType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDateTime(log.entryTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.exitTime ? (
                      <div className="text-sm text-gray-900">{formatDateTime(log.exitTime)}</div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.duration || calculateDuration(log.entryTime, log.exitTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(!!log.exitTime)}`}>
                      {log.exitTime ? 'Completed' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetailsModal(true);
                      }} 
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Logs Found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'ALL' || filterType !== 'ALL'
              ? 'No logs match your current filters.'
              : 'No vehicle logs have been recorded yet.'}
          </p>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Log Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Log ID:</span>
                <span className="font-medium">#{selectedLog.logId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle Number:</span>
                <span className="font-medium">{selectedLog.vehicleNumber}</span>
              </div>
              {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-medium">{getUserName(selectedLog.userId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{getUserEmail(selectedLog.userId)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Slot:</span>
                <span className="font-medium">{selectedLog.slotId} ({selectedLog.slotType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Time:</span>
                <span className="font-medium">{formatDateTime(selectedLog.entryTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exit Time:</span>
                <span className="font-medium">
                  {selectedLog.exitTime ? formatDateTime(selectedLog.exitTime) : 'Still parked'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {selectedLog.duration || calculateDuration(selectedLog.entryTime, selectedLog.exitTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(!!selectedLog.exitTime)}`}>
                  {selectedLog.exitTime ? 'Completed' : 'Active'}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default VehicleLogs; 