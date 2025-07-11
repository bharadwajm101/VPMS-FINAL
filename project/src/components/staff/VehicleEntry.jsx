import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowRightLeft, 
  Car, 
  Clock, 
  User, 
  MapPin, 
  LogIn, 
  LogOut, 
  Search, 
  Filter,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { vehicleLogService, slotService, userService, billingService } from '../../services/api';

const VehicleEntry = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('entry');
  const [allSlots, setAllSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeLogs, setActiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [exitLoading, setExitLoading] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingAmount, setBillingAmount] = useState(0);
  const [exitLog, setExitLog] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [entryFormData, setEntryFormData] = useState({
    vehicleNumber: '',
    userId: '',
    userEmail: ''
  });
  const [userLookupResult, setUserLookupResult] = useState(null);
  const [userLookupLoading, setUserLookupLoading] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [slotsData, allUsers, logsData] = await Promise.all([
        slotService.getAllSlots(),
        userService.getAllUsers(),
        vehicleLogService.getAllLogs(),
      ]);
      
      setAllSlots(slotsData);
      setUsers(allUsers);
      
      // Get active reservations to filter out reserved slots
      const activeLogs = logsData.logs.filter(log => !log.exitTime);
      setActiveLogs(activeLogs);
      
      // Filter available slots (not occupied AND not actively logged)
      const occupiedSlotIds = new Set(activeLogs.map(log => log.slotId));
      const availableSlots = slotsData.filter(slot => 
        !slot.occupied && !occupiedSlotIds.has(slot.slotId)
      );
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data. Please try again.');
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowEntryModal(true);
  };

  const lookupUser = async () => {
    if (!entryFormData.userEmail) {
      setMessage('Please enter an email address to lookup user.');
      return;
    }

    try {
      setUserLookupLoading(true);
      const userData = await userService.getUserByEmail(entryFormData.userEmail);
      setUserLookupResult(userData);
      setEntryFormData(prev => ({ ...prev, userId: userData.id.toString() }));
      setMessage(`User found: ${userData.name} (ID: ${userData.id})`);
    } catch (error) {
      setUserLookupResult(null);
      setMessage('User not found. Please check the email address.');
    } finally {
      setUserLookupLoading(false);
    }
  };

  const handleVehicleEntry = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !entryFormData.vehicleNumber || !entryFormData.userId) {
      setMessage('Please fill in all required fields.');
      return;
    }

    // Validate user ID exists
    const userExists = users.find(u => u.id === parseInt(entryFormData.userId));
    if (!userExists) {
      setMessage('Invalid User ID. Please use the lookup feature to find a valid user.');
      return;
    }

    try {
      setLoading(true);
      const entryData = {
        vehicleNumber: entryFormData.vehicleNumber,
        userId: parseInt(entryFormData.userId),
        slotId: selectedSlot.slotId,
      };
      
      await vehicleLogService.recordEntry(entryData);
      setMessage('Vehicle entry recorded successfully!');
      setShowEntryModal(false);
      setSelectedSlot(null);
      setEntryFormData({ vehicleNumber: '', userId: '', userEmail: '' });
      setUserLookupResult(null);
      await fetchData();
    } catch (error) {
      setMessage('Error recording vehicle entry. Please try again.');
      console.error('Error recording entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleExit = async (log) => {
    setSelectedLog(log);
    setShowExitModal(true);
  };

  const confirmExit = async () => {
    if (!selectedLog) return;
    
    try {
      setExitLoading(true);
      
      // Record the exit
      const exitResponse = await vehicleLogService.recordExit(selectedLog.logId);
      setExitLog(exitResponse);
      
      // Calculate billing amount
      const entryTime = new Date(selectedLog.entryTime);
      const exitTime = new Date(exitResponse.exitTime);
      const durationMinutes = Math.ceil((exitTime - entryTime) / (1000 * 60));
      const ratePerMinute = selectedLog.slotType === '2W' ? 1 : 2;
      const amount = durationMinutes * ratePerMinute;
      setBillingAmount(amount);
      
      setShowExitModal(false);
      setShowBillingModal(true);
      
      await fetchData();
    } catch (error) {
      setMessage('Error recording vehicle exit. Please try again.');
      console.error('Error recording exit:', error);
      setShowExitModal(false);
    } finally {
      setExitLoading(false);
    }
  };

  const handlePayment = async (paymentMethod) => {
    if (!exitLog) return;
    
    try {
      console.log('Exit log data:', exitLog);
      
      // Create billing invoice for the vehicle log
      const billingData = {
        userId: exitLog.userId,
        logId: exitLog.logId,
        Type: exitLog.slotType, // Note: DTO field is "Type" with capital T
        paymentMethod: paymentMethod
        // timestamp will be set by backend to current time
      };
      
      console.log('Billing data being sent:', billingData);
      const invoice = await billingService.createInvoice(billingData);
      console.log('Invoice created:', invoice);
      
      // Pay the invoice immediately
      const paymentRequest = {
        paymentMethod: paymentMethod
      };
      console.log('Payment request:', paymentRequest);
      await billingService.payInvoice(invoice.invoiceId, paymentRequest);
      
      setMessage(`Payment successful! Amount: $${billingAmount.toFixed(2)}. Vehicle exit completed.`);
      setShowBillingModal(false);
      setExitLog(null);
      setBillingAmount(0);
      setSelectedLog(null);
      
      // Trigger dashboard refresh by dispatching a custom event
      console.log('VehicleEntry - Dispatching paymentSuccess event with invoice:', invoice.invoiceId);
      window.dispatchEvent(new CustomEvent('paymentSuccess', {
        detail: { invoiceId: invoice.invoiceId, amount: billingAmount }
      }));
      
      // Also trigger a manual refresh after a short delay to ensure data is updated
      setTimeout(() => {
        console.log('VehicleEntry - Triggering manual refresh after payment');
        window.dispatchEvent(new CustomEvent('refreshDashboards'));
      }, 1000);
      
    } catch (error) {
      setMessage('Error processing payment. Please try again.');
      console.error('Error processing payment:', error);
      console.error('Error details:', error.response?.data);
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

  const calculateDuration = (entryTime) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  const filteredActiveLogs = activeLogs.filter(log => {
    const matchesSearch = log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getUserName(log.userId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || log.slotType === filterType;
    return matchesSearch && matchesType;
  });

  const filteredAvailableSlots = availableSlots.filter(slot => {
    return filterType === 'ALL' || slot.type === filterType;
  });

  const getSlotStatus = (slot) => {
    const isOccupied = slot.occupied;
    const hasActiveLog = activeLogs.some(log => log.slotId === slot.slotId);
    
    if (isOccupied || hasActiveLog) {
      return { status: 'occupied', color: 'bg-red-50 border-red-200', textColor: 'text-red-600' };
    } else {
      return { status: 'available', color: 'bg-green-50 border-green-200', textColor: 'text-green-600' };
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Entry & Exit Management</h1>
            <p className="text-gray-600">Manage vehicle entry and exit operations with real-time updates</p>
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

      {/* Message Display */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800">{message}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('entry')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'entry' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <LogIn className="w-4 h-4 inline mr-2" />
          Vehicle Entry
        </button>
        <button
          onClick={() => setActiveTab('exit')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'exit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <LogOut className="w-4 h-4 inline mr-2" />
          Vehicle Exit
        </button>
      </div>

      {/* All Slots Overview */}
      {activeTab === 'entry' && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">All Parking Slots ({allSlots.length})</h3>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="2W">2-Wheeler</option>
                  <option value="4W">4-Wheeler</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {allSlots
                .filter(slot => filterType === 'ALL' || slot.type === filterType)
                .map(slot => {
                  const slotStatus = getSlotStatus(slot);
                  return (
                    <div 
                      key={slot.slotId} 
                      className={`${slotStatus.color} border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                        slotStatus.status === 'available' ? 'hover:bg-green-100' : 'cursor-not-allowed'
                      }`}
                      onClick={() => slotStatus.status === 'available' && handleSlotSelect(slot)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Car className={`w-5 h-5 ${slotStatus.textColor}`} />
                          <span className="font-semibold text-gray-800">{slot.location}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${slot.type === '2W' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {slot.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Slot ID: #{slot.slotId}</div>
                        <div className={`font-medium ${slotStatus.textColor}`}>
                          {slotStatus.status === 'available' ? 'Available' : 'Occupied'}
                        </div>
                        {slotStatus.status === 'available' && (
                          <div className="text-xs text-gray-500 mt-1">Click to record entry</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Active Vehicles Cards */}
      {activeTab === 'exit' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Currently Parked Vehicles ({filteredActiveLogs.length})</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="ALL">All Types</option>
                  <option value="2W">2-Wheeler</option>
                  <option value="4W">4-Wheeler</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredActiveLogs.map(log => (
              <div key={log.logId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-800">{log.vehicleNumber}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${log.slotType === '2W' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {log.slotType}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{getUserName(log.userId)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Slot {log.slotId}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {calculateDuration(log.entryTime)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Entry: {new Date(log.entryTime).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleVehicleExit(log)}
                  className="w-full bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 inline mr-1" />
                  Record Exit
                </button>
              </div>
            ))}
            {filteredActiveLogs.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No vehicles currently parked</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Entry Modal */}
      {showEntryModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Record Vehicle Entry - Slot {selectedSlot.location}
            </h3>
            <form onSubmit={handleVehicleEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                <input 
                  type="text" 
                  value={entryFormData.vehicleNumber}
                  onChange={(e) => setEntryFormData({...entryFormData, vehicleNumber: e.target.value})}
                  placeholder="Enter vehicle number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email (for lookup)</label>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    value={entryFormData.userEmail}
                    onChange={(e) => setEntryFormData({...entryFormData, userEmail: e.target.value})}
                    placeholder="Enter user email" 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <button
                    type="button"
                    onClick={lookupUser}
                    disabled={userLookupLoading || !entryFormData.userEmail}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {userLookupLoading ? '...' : 'Lookup'}
                  </button>
                </div>
              </div>

              {userLookupResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">User Found:</span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    <div>Name: {userLookupResult.name}</div>
                    <div>Email: {userLookupResult.email}</div>
                    <div>ID: {userLookupResult.id}</div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                <input 
                  type="number" 
                  value={entryFormData.userId}
                  onChange={(e) => setEntryFormData({...entryFormData, userId: e.target.value})}
                  placeholder="Enter user ID or use lookup above" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the lookup feature above to find the correct User ID, or enter it manually if you know it.
                </p>
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
                    setShowEntryModal(false);
                    setSelectedSlot(null);
                    setEntryFormData({ vehicleNumber: '', userId: '', userEmail: '' });
                    setUserLookupResult(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Record Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Vehicle Exit</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Vehicle Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{selectedLog.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-medium">{getUserName(selectedLog.userId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slot:</span>
                    <span className="font-medium">{selectedLog.slotId} ({selectedLog.slotType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{calculateDuration(selectedLog.entryTime)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExit}
                  disabled={exitLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {exitLoading ? 'Processing...' : 'Confirm Exit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && exitLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Required</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Exit Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span>{exitLog.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span>{getUserName(exitLog.userId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{exitLog.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span>${exitLog.slotType === '2W' ? '1' : '2'}/min</span>
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
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Pay with Cash</span>
                  </button>
                  <button
                    onClick={() => handlePayment('UPI')}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with UPI</span>
                  </button>
                  <button
                    onClick={() => handlePayment('CARD')}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Card</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleEntry; 