import React, { useEffect, useState } from 'react';
import { slotService, reservationService, vehicleLogService } from '../services/api';
import { Car, RefreshCw } from 'lucide-react';

const getStatus = (slot, activeReservations, activeLogs) => {
  // First check if slot is marked as occupied in database (highest priority)
  if (slot.occupied) return 'occupied';
  
  // Then check if slot is occupied by a vehicle (medium priority)
  const isOccupiedByVehicle = activeLogs.some(log => log.slotId === slot.slotId);
  if (isOccupiedByVehicle) return 'occupied';
  
  // Then check if slot is reserved (lowest priority)
  const isReserved = activeReservations.some(res => 
    res.slotId === slot.slotId && res.status === 'ACTIVE'
  );
  if (isReserved) return 'reserved';
  
  // Otherwise slot is available
  return 'available';
};

const statusColors = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  occupied: 'bg-red-100 text-red-800',
};

const statusLabels = {
  available: 'Available',
  reserved: 'Reserved',
  occupied: 'Occupied',
};

const ParkingSlotMap = () => {
  const [slots, setSlots] = useState([]);
  const [activeReservations, setActiveReservations] = useState([]);
  const [activeLogs, setActiveLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [allSlots, allReservations, allLogs] = await Promise.all([
        slotService.getAllSlots(),
        reservationService.getAllReservations(),
        vehicleLogService.getAllLogs(),
      ]);
      setSlots(allSlots);
      setActiveReservations(allReservations.filter(r => r.status === 'ACTIVE'));
      setActiveLogs(allLogs.logs.filter(log => !log.exitTime));
    } catch (err) {
      setError('Error loading parking slot map.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-700 bg-red-100 rounded">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Car className="w-6 h-6 mr-2" />
          Parking Slot Map
        </h1>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      <div className="mb-4 flex space-x-4">
        <div className="flex items-center space-x-2"><span className="w-4 h-4 rounded-full bg-green-100 border border-green-400 inline-block"></span><span>Available</span></div>
        <div className="flex items-center space-x-2"><span className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-400 inline-block"></span><span>Reserved</span></div>
        <div className="flex items-center space-x-2"><span className="w-4 h-4 rounded-full bg-red-100 border border-red-400 inline-block"></span><span>Occupied</span></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {slots.map(slot => {
          const status = getStatus(slot, activeReservations, activeLogs);
          return (
            <div key={slot.slotId} className={`rounded-lg shadow p-4 flex flex-col items-center border ${statusColors[status]}`}> 
              <Car className="w-8 h-8 mb-2" />
              <div className="font-bold">{slot.location}</div>
              <div className="text-xs mb-1">Type: {slot.type}</div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>{statusLabels[status]}</div>
              <div className="text-xs text-gray-500 mt-1">Slot #{slot.slotId}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParkingSlotMap; 