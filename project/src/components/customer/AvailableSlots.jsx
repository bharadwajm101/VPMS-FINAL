import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, MapPin, Clock, Calendar, Filter } from 'lucide-react';
import { slotService, reservationService, billingService } from '../../services/api';

const AvailableSlots = () => {
  const { token, user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [billingAmount, setBillingAmount] = useState(0);
  const [activeReservations, setActiveReservations] = useState([]);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    fetchSlots();
    
    // Auto-refresh every 15 seconds to show real-time availability (reduced from 30s)
    const interval = setInterval(fetchSlots, 15000);
    
    // Listen for reservation events to trigger immediate refresh
    const handleReservationUpdate = () => {
      console.log('AvailableSlots - Reservation update detected, refreshing slots...');
      fetchSlots();
    };
    
    const handlePaymentSuccess = () => {
      console.log('AvailableSlots - Payment success detected, refreshing slots...');
      fetchSlots();
    };
    
    window.addEventListener('reservationUpdate', handleReservationUpdate);
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('reservationUpdate', handleReservationUpdate);
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
    };
  }, [token, filterType]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const [allSlots, reservationsData] = await Promise.all([
        slotService.getAllSlots(),
        reservationService.getAllReservations(),
      ]);
      
      // Filter out slots that have active reservations
      const activeReservations = reservationsData.filter(r => r.status === 'ACTIVE');
      setActiveReservations(activeReservations);
      
      // Get truly available slots (not occupied in database AND not actively reserved)
      const availableSlots = allSlots.filter(slot => {
        const hasActiveReservation = activeReservations.some(r => r.slotId === slot.slotId);
        // Slot is available if: not occupied in database AND no active reservation
        return !slot.occupied && !hasActiveReservation;
      });
      
      // Apply type filter
      const filteredSlots = filterType === 'ALL' 
        ? availableSlots
        : availableSlots.filter(slot => slot.type === filterType);
        
      setSlots(filteredSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSlot = async (slotId) => {
    const slot = slots.find(s => s.slotId === slotId);
    if (slot) {
      setSelectedSlot(slot);
      setShowReservationModal(true);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!user || !selectedSlot) return;

    const formData = new FormData(e.target);
    const startTime = new Date(formData.get('startTime'));
    const endTime = new Date(formData.get('endTime'));
    
    // Calculate duration in minutes
    const durationMinutes = Math.ceil((endTime - startTime) / (1000 * 60));
    
    // Calculate billing amount (2W: $1/min, 4W: $2/min)
    const ratePerMinute = selectedSlot.type === '2W' ? 1 : 2;
    const amount = durationMinutes * ratePerMinute;
    
    const reservationData = {
      userId: user.id,
      slotId: selectedSlot.slotId,
      vehicleNumber: formData.get('vehicleNumber'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      type: selectedSlot.type,
    };

    // Store reservation data and show billing popup
    setReservationData(reservationData);
    setBillingAmount(amount);
    setShowReservationModal(false);
    setShowBillingModal(true);
  };

  const handlePayment = async (paymentMethod) => {
    if (!reservationData) return;

    // For UPI payment, show UPI modal first
    if (paymentMethod === 'UPI') {
      setShowUpiModal(true);
      return;
    }

    try {
      setReservationLoading(true);
      console.log('Creating reservation with data:', reservationData);
      
      // Create the reservation first
      const reservationResponse = await reservationService.createReservation(reservationData);
      console.log('Reservation created:', reservationResponse);
      const reservation = reservationResponse.reservation || reservationResponse;
      
      // Create billing invoice for the reservation
      const billingData = {
        userId: user.id,
        reservationId: reservation.reservationId,
        paymentMethod: paymentMethod
        // timestamp will be set by backend to current time
      };
      console.log('Creating invoice with data:', billingData);
      
      // Create and pay the invoice immediately
      const invoice = await billingService.createInvoice(billingData);
      console.log('Invoice created:', invoice);
      
      // Pay the invoice with proper PaymentRequestDTO format
      const paymentRequest = {
        paymentMethod: paymentMethod
      };
      console.log('Paying invoice with request:', paymentRequest);
      await billingService.payInvoice(invoice.invoiceId, paymentRequest);
      
      // Add 3-second buffer for payment success
      setTimeout(() => {
        setMessage('Payment successful! Reservation created and payment completed.');
        setShowBillingModal(false);
        setReservationData(null);
        setBillingAmount(0);
        
        // Trigger immediate refresh and notify other components
        console.log('AvailableSlots - Dispatching reservationUpdate event');
        window.dispatchEvent(new CustomEvent('reservationUpdate', {
          detail: { reservationId: reservation.reservationId, slotId: reservationData.slotId }
        }));
        
        // Also trigger payment success event for other components
        window.dispatchEvent(new CustomEvent('paymentSuccess', {
          detail: { invoiceId: invoice.invoiceId, amount: billingAmount }
        }));
        
        fetchSlots();
      }, 3000);
      
    } catch (error) {
      console.error('Detailed error:', error.response || error);
      setMessage(`Error creating reservation: ${error.response?.data?.message || error.message}`);
      setReservationLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!upiId.trim()) {
      setMessage('Please enter a valid UPI ID');
      return;
    }

    try {
      setReservationLoading(true);
      setShowUpiModal(false);
      
      // Create the reservation first
      const reservationResponse = await reservationService.createReservation(reservationData);
      const reservation = reservationResponse.reservation || reservationResponse;
      
      // Create billing invoice for the reservation
      const billingData = {
        userId: user.id,
        reservationId: reservation.reservationId,
        paymentMethod: 'UPI'
        // timestamp will be set by backend to current time
      };
      
      // Create and pay the invoice immediately
      const invoice = await billingService.createInvoice(billingData);
      
      // Pay the invoice with proper PaymentRequestDTO format
      const paymentRequest = {
        paymentMethod: 'UPI'
      };
      await billingService.payInvoice(invoice.invoiceId, paymentRequest);
      
      // Add 3-second buffer for payment success
      setTimeout(() => {
        setMessage(`UPI Payment successful! UPI ID: ${upiId}. Reservation created and payment completed.`);
        setShowBillingModal(false);
        setReservationData(null);
        setBillingAmount(0);
        setUpiId('');
        fetchSlots();
      }, 3000);
      
    } catch (error) {
      setMessage('Error creating reservation. Please try again.');
      console.error('Error creating reservation:', error);
      setReservationLoading(false);
    }
  };

  const stats = {
    total: slots.length,
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Available Parking Slots</h1>
        <p className="text-gray-600">Find and reserve parking slots</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Available</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.twoWheeler}</div>
          <div className="text-sm text-gray-600">2-Wheeler Slots</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.fourWheeler}</div>
          <div className="text-sm text-gray-600">4-Wheeler Slots</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
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
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slots.map((slot) => (
          <div key={slot.slotId} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-800">{slot.location}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                slot.type === '2W' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {slot.type}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Slot ID:</span>
                <span className="font-medium">#{slot.slotId}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{slot.location}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Available
                </span>
              </div>
            </div>
            
            <button
              onClick={() => handleReserveSlot(slot.slotId)}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reserve Slot
            </button>
          </div>
        ))}
      </div>

      {slots.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
          <p className="text-gray-500">
            {filterType === 'ALL' 
              ? 'All parking slots are currently occupied.' 
              : `No ${filterType} slots are available at the moment.`}
          </p>
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Reserve Slot {selectedSlot.location}
            </h3>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Enter vehicle number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Slot Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{selectedSlot.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>{selectedSlot.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slot ID:</span>
                    <span>#{selectedSlot.slotId}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReservationModal(false);
                    setSelectedSlot(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reservationLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {reservationLoading ? 'Creating...' : 'Create Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && reservationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Required
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Reservation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slot:</span>
                    <span>{selectedSlot?.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span>{reservationData.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{Math.ceil((new Date(reservationData.endTime) - new Date(reservationData.startTime)) / (1000 * 60))} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span>${selectedSlot?.type === '2W' ? '1' : '2'}/min</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>${billingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handlePayment('CASH')}
                    disabled={reservationLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <span>Pay with Cash</span>
                  </button>
                  <button
                    onClick={() => handlePayment('UPI')}
                    disabled={reservationLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <span>Pay with UPI</span>
                  </button>
                  <button
                    onClick={() => handlePayment('CARD')}
                    disabled={reservationLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <span>Pay with Card</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBillingModal(false);
                    setReservationData(null);
                    setBillingAmount(0);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Enter UPI ID
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter your UPI ID (e.g., user@upi)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpiPayment}
                  disabled={reservationLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {reservationLoading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableSlots; 