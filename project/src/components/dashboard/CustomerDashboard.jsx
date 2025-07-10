import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  Calendar, 
  Receipt, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Users,
  RefreshCw
} from 'lucide-react';
import { 
  slotService, 
  reservationService, 
  billingService,
  vehicleLogService
} from '../../services/api';
import ParkingSlotMap from '../ParkingSlotMap';

const CustomerDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    availableSlots: 0,
    myReservations: 0,
    activeReservations: 0,
    totalBills: 0,
    unpaidBills: 0,
    recentVehicles: 0,
    myVehicleLogs: 0,
    activeVehicleLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentVehicleLogs, setRecentVehicleLogs] = useState([]);
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Listen for payment success events to refresh dashboard
    const handlePaymentSuccess = (event) => {
      console.log('CustomerDashboard - Payment success detected, refreshing data...', event.detail);
      fetchDashboardData();
    };
    
    const handleRefreshDashboards = () => {
      console.log('CustomerDashboard - Manual refresh triggered');
      fetchDashboardData();
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('refreshDashboards', handleRefreshDashboards);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('refreshDashboards', handleRefreshDashboards);
    };
  }, [token, user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      const [availableSlots, reservations, bills, vehicleLogs] = await Promise.all([
        slotService.getAvailableSlots(),
        reservationService.getUserReservations(user.id),
        billingService.getUserInvoices(user.id),
        vehicleLogService.getUserLogs(user.id),
      ]);

      console.log('CustomerDashboard - Processing bills:', bills);
      const activeReservations = reservations.filter(r => r.status === 'ACTIVE').length;
      const unpaidBills = bills.filter(b => b.status === 'UNPAID').length;
      const activeVehicleLogs = vehicleLogs.filter(log => !log.exitTime).length;
      
      console.log('CustomerDashboard - Billing stats:', { totalBills: bills.length, unpaidBills });

      setStats({
        availableSlots: availableSlots.length,
        myReservations: reservations.length,
        activeReservations,
        totalBills: bills.length,
        unpaidBills,
        myVehicleLogs: vehicleLogs.length,
        activeVehicleLogs,
      });

      // Recent reservations (last 5)
      setRecentReservations(reservations.slice(-5).reverse());
      
      // Recent vehicle logs (last 5)
      setRecentVehicleLogs(vehicleLogs.slice(-5).reverse());
      
      // Recent bills (last 5)
      setRecentBills(bills.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Available Slots',
      value: stats.availableSlots,
      icon: Car,
      color: 'bg-green-500',
      change: 'Ready to book',
    },
    {
      title: 'My Reservations',
      value: stats.myReservations,
      icon: Calendar,
      color: 'bg-blue-500',
      change: `${stats.activeReservations} active`,
    },
    {
      title: 'My Vehicle Logs',
      value: stats.myVehicleLogs,
      icon: MapPin,
      color: 'bg-purple-500',
      change: `${stats.activeVehicleLogs} currently parked`,
    },
    {
      title: 'Bills',
      value: stats.totalBills,
      icon: Receipt,
      color: 'bg-yellow-500',
      change: `${stats.unpaidBills} unpaid`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parking Slot Map */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parking Slot Map</h3>
        <ParkingSlotMap />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reservations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reservations</h3>
          <div className="space-y-4">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => (
                <div key={reservation.reservationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full p-2 ${
                      reservation.status === 'ACTIVE' ? 'bg-green-100' : 
                      reservation.status === 'COMPLETED' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Calendar className={`w-4 h-4 ${
                        reservation.status === 'ACTIVE' ? 'text-green-600' : 
                        reservation.status === 'COMPLETED' ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reservation.vehicleNumber}</p>
                      <p className="text-sm text-gray-500">
                        Slot {reservation.slotId} • {reservation.type} • {reservation.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(reservation.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reservation.durationMinutes} minutes
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent reservations</p>
            )}
          </div>
        </div>

        {/* Recent Vehicle Logs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Vehicle Activity</h3>
          <div className="space-y-4">
            {recentVehicleLogs.length > 0 ? (
              recentVehicleLogs.map((log) => (
                <div key={log.logId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full p-2 ${log.exitTime ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <Car className={`w-4 h-4 ${log.exitTime ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.vehicleNumber}</p>
                      <p className="text-sm text-gray-500">
                        Slot {log.slotId} • {log.slotType} • {log.exitTime ? 'Completed' : 'Active'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(log.entryTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {log.duration || 'Ongoing'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent vehicle activity</p>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bills</h3>
          <div className="space-y-4">
            {recentBills.length > 0 ? (
              recentBills.map((bill) => (
                <div key={bill.invoiceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full p-2 ${
                      bill.status === 'PAID' ? 'bg-green-100' : 
                      bill.status === 'UNPAID' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <Receipt className={`w-4 h-4 ${
                        bill.status === 'PAID' ? 'text-green-600' : 
                        bill.status === 'UNPAID' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{bill.invoiceId}</p>
                      <p className="text-sm text-gray-500">
                        {bill.type} • {bill.status} • ${bill.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(bill.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {bill.paymentMethod}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent bills</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => window.location.href = '/available-slots'}
            className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg transition-colors"
          >
            <Car className="w-5 h-5" />
            <span className="font-medium">Find Available Slots</span>
          </button>
          <button 
            onClick={() => window.location.href = '/my-reservations'}
            className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">My Reservations</span>
          </button>
          <button 
            onClick={() => window.location.href = '/my-bills'}
            className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg transition-colors"
          >
            <Receipt className="w-5 h-5" />
            <span className="font-medium">My Bills</span>
          </button>
          <button 
            onClick={() => window.location.href = '/vehicle-logs'}
            className="flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Vehicle History</span>
          </button>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
        <div className="space-y-4">
          {stats.unpaidBills > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Unpaid Bills</p>
                <p className="text-sm text-red-600">You have {stats.unpaidBills} unpaid bills</p>
              </div>
            </div>
          )}
          
          {stats.activeReservations > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Active Reservations</p>
                <p className="text-sm text-green-600">You have {stats.activeReservations} active reservations</p>
              </div>
            </div>
          )}
          
          {stats.activeVehicleLogs > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Car className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Currently Parked</p>
                <p className="text-sm text-yellow-600">You have {stats.activeVehicleLogs} vehicles currently parked</p>
              </div>
            </div>
          )}
          
          {stats.availableSlots > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Car className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Slots Available</p>
                <p className="text-sm text-blue-600">{stats.availableSlots} parking slots are available now</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;