import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { slotService } from '../../services/api';
import { reservationService } from '../../services/api';

const SlotManagement = () => {
  const { token, user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchSlots, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token, user]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');
      if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
        setError('You do not have permission to view slots. Please login as an admin or staff.');
        setSlots([]);
        setLoading(false);
        return;
      }
      
      const [slotsData, reservationsData] = await Promise.all([
        slotService.getAllSlots(),
        reservationService.getAllReservations(),
      ]);
      
      // Get active reservations
      const activeReservations = reservationsData.filter(r => r.status === 'ACTIVE');
      
      // Update slot availability based on both database occupied status and reservations
      const updatedSlots = slotsData.map(slot => {
        const isReserved = activeReservations.some(r => r.slotId === slot.slotId);
        return {
          ...slot,
          occupied: slot.occupied || isReserved // Slot is occupied if physically occupied OR reserved
        };
      });
      
      setSlots(updatedSlots);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setError('You do not have permission to view slots. Please login as an admin or staff.');
      } else {
        setError('Error fetching slots.');
      }
      setSlots([]);
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (slotData) => {
    try {
      await slotService.addSlot(slotData);
      await fetchSlots();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  const handleUpdateSlot = async (slotId, slotData) => {
    try {
      await slotService.updateSlot(slotId, slotData);
      await fetchSlots();
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      await slotService.deleteSlot(slotId);
      await fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const handleToggleOccupancy = async (slotId, currentStatus) => {
    try {
      await slotService.updateSlotOccupancy(slotId, !currentStatus);
      await fetchSlots();
    } catch (error) {
      console.error('Error updating slot occupancy:', error);
    }
  };

  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || slot.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'OCCUPIED' && slot.occupied) || 
                         (filterStatus === 'AVAILABLE' && !slot.occupied);
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: slots.length,
    occupied: slots.filter(s => s.occupied).length,
    available: slots.filter(s => !s.occupied).length,
    twoWheeler: slots.filter(s => s.type === '2W').length,
    fourWheeler: slots.filter(s => s.type === '4W').length,
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
      {error && (<div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>)}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Slot Management</h1>
          {user && user.role === 'ADMIN' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot</span>
            </button>
          )}
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Slots</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.twoWheeler}</div>
            <div className="text-sm text-gray-600">2-Wheeler</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{stats.fourWheeler}</div>
            <div className="text-sm text-gray-600">4-Wheeler</div>
          </div>
        </div>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search slots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
          </select>
        </div>
        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => (
            <div key={slot.slotId} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Car className={`w-5 h-5 ${slot.occupied ? 'text-red-500' : 'text-green-500'}`} />
                  <span className="font-semibold text-gray-800">{slot.location}</span>
                </div>
                <div className="flex space-x-1">
                  {user && user.role === 'ADMIN' && (
                    <>
                      <button onClick={() => setEditingSlot(slot)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteSlot(slot.slotId)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.type === '2W' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{slot.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{slot.occupied ? 'Occupied' : 'Available'}</span>
                </div>
                <button
                  onClick={() => handleToggleOccupancy(slot.slotId, slot.occupied)}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${slot.occupied ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  disabled={user && user.role !== 'ADMIN' && user.role !== 'STAFF'}
                >
                  {slot.occupied ? 'Mark Available' : 'Mark Occupied'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Add Slot Modal */}
      {showAddModal && user && user.role === 'ADMIN' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Slot</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddSlot({
                location: formData.get('location'),
                type: formData.get('type'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" placeholder="e.g., A1, B2, etc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    <option value="">Select Type</option>
                    <option value="2W">2-Wheeler</option>
                    <option value="4W">4-Wheeler</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Slot Modal */}
      {editingSlot && user && user.role === 'ADMIN' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Slot</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateSlot(editingSlot.slotId, {
                location: formData.get('location'),
                type: formData.get('type'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" defaultValue={editingSlot.location} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" defaultValue={editingSlot.type} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                    <option value="2W">2-Wheeler</option>
                    <option value="4W">4-Wheeler</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setEditingSlot(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Update Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotManagement; 