import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Car, Clock, MapPin, Filter, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { reservationService, slotService, billingService } from '../../services/api';

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [message, setMessage] = useState('');
  const [billingInfo, setBillingInfo] = useState({});

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [reservationsData, slotsData, billingData] = await Promise.all([
        reservationService.getUserReservations(user.id),
        slotService.getAllSlots(),
        billingService.getUserInvoices(user.id),
      ]);
      setReservations(reservationsData);
      setSlots(slotsData);
      
      // Create a map of reservation ID to billing info
      const billingMap = {};
      billingData.forEach(invoice => {
        if (invoice.reservationId) {
          billingMap[invoice.reservationId] = invoice;
        }
      });
      setBillingInfo(billingMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotLocation = (slotId) => {
    const slot = slots.find(s => s.slotId === slotId);
    return slot ? slot.location : 'Unknown Slot';
  };

  const handleUpdateReservation = async (reservationId, updatedData) => {
    try {
      // Get the current reservation to preserve existing data
      const currentReservation = reservations.find(r => r.reservationId === reservationId);
      if (!currentReservation) {
        setMessage('Reservation not found.');
        return;
      }

      // Prepare the full reservation data with existing values and updates
      const fullReservationData = {
        userId: currentReservation.userId,
        slotId: currentReservation.slotId,
        vehicleNumber: updatedData.vehicleNumber || currentReservation.vehicleNumber,
        startTime: updatedData.startTime || currentReservation.startTime,
        endTime: updatedData.endTime || currentReservation.endTime,
        type: currentReservation.type // Keep the original type
      };

      await reservationService.updateReservation(reservationId, fullReservationData);
      setMessage('Reservation updated successfully!');
      await fetchData();
      setEditingReservation(null);
    } catch (error) {
      setMessage('Error updating reservation. Please try again.');
      console.error('Error updating reservation:', error);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await reservationService.cancelReservation(reservationId);
      setMessage('Reservation cancelled successfully!');
      await fetchData();
    } catch (error) {
      setMessage('Error cancelling reservation. Please try again.');
      console.error('Error cancelling reservation:', error);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    return filterStatus === 'ALL' || reservation.status === filterStatus;
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reservations</h1>
        <p className="text-gray-600">View and manage your parking reservations</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800">{message}</p>
        </div>
      )}

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

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div key={reservation.reservationId} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Reservation #{reservation.reservationId}</h3>
                  <p className="text-sm text-gray-500">{reservation.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {reservation.status === 'ACTIVE' && (
                    <>
                      <button
                        onClick={() => setEditingReservation(reservation)}
                        className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelReservation(reservation.reservationId)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Slot:</span>
                <span className="font-medium">{getSlotLocation(reservation.slotId)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{reservation.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{reservation.durationMinutes} min</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">{new Date(reservation.startTime).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Billing Information */}
            {billingInfo[reservation.reservationId] && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Billing:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      billingInfo[reservation.reservationId].status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {billingInfo[reservation.reservationId].status}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    ${billingInfo[reservation.reservationId].amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Time: {new Date(reservation.startTime).toLocaleString()}</span>
                <span className="text-gray-600">End Time: {new Date(reservation.endTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reservations Found</h3>
          <p className="text-gray-500">
            {filterStatus === 'ALL' 
              ? 'You have no reservations yet. Create your first reservation!' 
              : `No ${filterStatus.toLowerCase()} reservations found.`}
          </p>
        </div>
      )}

      {/* View Reservation Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reservation Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Reservation ID:</span>
                <span className="font-medium">#{selectedReservation.reservationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{selectedReservation.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slot:</span>
                <span className="font-medium">{getSlotLocation(selectedReservation.slotId)} (#{selectedReservation.slotId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{selectedReservation.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-medium">{new Date(selectedReservation.startTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Time:</span>
                <span className="font-medium">{new Date(selectedReservation.endTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{selectedReservation.durationMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReservation.status)}`}>
                  {selectedReservation.status}
                </span>
              </div>
              {billingInfo[selectedReservation.reservationId] && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice ID:</span>
                    <span className="font-medium">#{billingInfo[selectedReservation.reservationId].invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">${billingInfo[selectedReservation.reservationId].amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      billingInfo[selectedReservation.reservationId].status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {billingInfo[selectedReservation.reservationId].status}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
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
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingReservation(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations; 