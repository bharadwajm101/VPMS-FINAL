import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, Clock, MapPin, Calendar, Filter, Eye } from 'lucide-react';
import { vehicleLogService } from '../../services/api';

const MyVehicles = () => {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [token, user]);

  const fetchLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await vehicleLogService.getUserLogs(user.id);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching vehicle logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    return filterStatus === 'ALL' || 
           (filterStatus === 'ACTIVE' && !log.exitTime) || 
           (filterStatus === 'COMPLETED' && log.exitTime);
  });

  const stats = {
    total: logs.length,
    active: logs.filter(log => !log.exitTime).length,
    completed: logs.filter(log => log.exitTime).length,
    uniqueVehicles: new Set(logs.map(log => log.vehicleNumber)).size,
  };

  const getStatusColor = (hasExitTime) => {
    return hasExitTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const calculateDuration = (entryTime, exitTime) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diffMs = exit.getTime() - entry.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Vehicle History</h1>
        <p className="text-gray-600">Track your vehicle parking history and current status</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Visits</div>
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
          <div className="text-2xl font-bold text-purple-600">{stats.uniqueVehicles}</div>
          <div className="text-sm text-gray-600">Unique Vehicles</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Visits</option>
            <option value="ACTIVE">Currently Parked</option>
            <option value="COMPLETED">Completed Visits</option>
          </select>
        </div>
      </div>

      {/* Vehicle Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.logId} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`${log.exitTime ? 'bg-green-100' : 'bg-yellow-100'} rounded-full p-2`}>
                  <Car className={`w-5 h-5 ${log.exitTime ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{log.vehicleNumber}</h3>
                  <p className="text-sm text-gray-500">Log #{log.logId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(!!log.exitTime)}`}>
                  {log.exitTime ? 'Completed' : 'Active'}
                </span>
                <button
                  onClick={() => setSelectedLog(log)}
                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Slot:</span>
                <span className="font-medium">{log.slotId} ({log.slotType})</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Entry:</span>
                <span className="font-medium">{new Date(log.entryTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {log.duration || calculateDuration(log.entryTime, log.exitTime || undefined)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Exit:</span>
                <span className="font-medium">
                  {log.exitTime ? new Date(log.exitTime).toLocaleDateString() : 'Still parked'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Entry: {new Date(log.entryTime).toLocaleString()}
                </span>
                <span className="text-gray-600">
                  {log.exitTime ? `Exit: ${new Date(log.exitTime).toLocaleString()}` : 'Currently parked'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle History Found</h3>
          <p className="text-gray-500">
            {filterStatus === 'ALL' 
              ? 'You have no vehicle parking history yet.' 
              : `No ${filterStatus.toLowerCase()} vehicle records found.`}
          </p>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
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
              <div className="flex justify-between">
                <span className="text-gray-600">Slot:</span>
                <span className="font-medium">{selectedLog.slotId} ({selectedLog.slotType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Time:</span>
                <span className="font-medium">{new Date(selectedLog.entryTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exit Time:</span>
                <span className="font-medium">
                  {selectedLog.exitTime ? new Date(selectedLog.exitTime).toLocaleString() : 'Still parked'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {selectedLog.duration || calculateDuration(selectedLog.entryTime, selectedLog.exitTime || undefined)}
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
                onClick={() => setSelectedLog(null)}
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

export default MyVehicles; 