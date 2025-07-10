import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, Car, Clock, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { reservationService, userService, slotService } from '../../services/api';

const ReservationManagement = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reservationsData, usersData, slotsData] = await Promise.all([
        reservationService.getAllReservations(),
        userService.getAllUsers(),
        slotService.getAllSlots(),
      ]);
      setReservations(reservationsData);
      setUsers(usersData);
      setSlots(slotsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getSlotLocation = (slotId) => {
    const slot = slots.find(s => s.slotId === slotId);
    return slot ? slot.location : 'Unknown Slot';
  };

  const handleUpdateReservation = async (reservationId, updatedData) => {
    try {
      if (updatedData.status) {
        // Admin is updating status - use the status endpoint
        await reservationService.updateReservationStatus(reservationId, updatedData.status);
      } else {
        // Admin is updating other fields - use the regular update endpoint
        const currentReservation = reservations.find(r => r.reservationId === reservationId);
        if (!currentReservation) {
          console.error('Reservation not found');
          return;
        }

        const fullReservationData = {
          userId: currentReservation.userId,
          slotId: currentReservation.slotId,
          vehicleNumber: updatedData.vehicleNumber || currentReservation.vehicleNumber,
          startTime: updatedData.startTime || currentReservation.startTime,
          endTime: updatedData.endTime || currentReservation.endTime,
          type: currentReservation.type
        };

        await reservationService.updateReservation(reservationId, fullReservationData);
      }
      
      await fetchData();
      setEditingReservation(null);
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await reservationService.cancelReservation(reservationId);
      await fetchData();
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getUserName(reservation.userId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || reservation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === 'ACTIVE').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reservation Management</h1>
        <p className="text-gray-600">Manage all parking reservations</p>
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Reservations</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by vehicle number or user name..."
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
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      {/* Reservations Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.reservationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">#{reservation.reservationId}</div>
                        <div className="text-sm text-gray-500">{reservation.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getUserName(reservation.userId)}</div>
                    <div className="text-sm text-gray-500">ID: {reservation.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{reservation.vehicleNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getSlotLocation(reservation.slotId)}</div>
                    <div className="text-sm text-gray-500">Slot {reservation.slotId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(reservation.startTime).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(reservation.startTime).toLocaleTimeString()} - {new Date(reservation.endTime).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{reservation.durationMinutes} min</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>{reservation.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => setSelectedReservation(reservation)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditingReservation(reservation)} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleCancelReservation(reservation.reservationId)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* View Reservation Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reservation Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-600">Reservation ID:</span><span className="font-medium">#{selectedReservation.reservationId}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">User:</span><span className="font-medium">{getUserName(selectedReservation.userId)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Vehicle:</span><span className="font-medium">{selectedReservation.vehicleNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Slot:</span><span className="font-medium">{getSlotLocation(selectedReservation.slotId)} (#{selectedReservation.slotId})</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{selectedReservation.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Start Time:</span><span className="font-medium">{new Date(selectedReservation.startTime).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">End Time:</span><span className="font-medium">{new Date(selectedReservation.endTime).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span className="font-medium">{selectedReservation.durationMinutes} minutes</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReservation.status)}`}>{selectedReservation.status}</span></div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedReservation(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Reservation Modal */}
      {editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Reservation</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedData = {
                vehicleNumber: formData.get('vehicleNumber'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                status: formData.get('status'),
              };
              handleUpdateReservation(editingReservation.reservationId, updatedData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    defaultValue={editingReservation.vehicleNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    defaultValue={new Date(editingReservation.startTime).toISOString().slice(0, -8)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    defaultValue={new Date(editingReservation.endTime).toISOString().slice(0, -8)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingReservation.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setEditingReservation(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement; 