import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Car, 
  ClipboardList, 
  Calendar, 
  Receipt,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  userService, 
  slotService, 
  vehicleLogService, 
  reservationService, 
  billingService 
} from '../../services/api';
import ParkingSlotMap from '../ParkingSlotMap';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSlots: 0,
    occupiedSlots: 0,
    totalLogs: 0,
    activeReservations: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Listen for payment success events to refresh dashboard
    const handlePaymentSuccess = (event) => {
      console.log('AdminDashboard - Payment success detected, refreshing data...', event.detail);
      fetchDashboardData();
    };
    
    const handleRefreshDashboards = () => {
      console.log('AdminDashboard - Manual refresh triggered');
      fetchDashboardData();
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('refreshDashboards', handleRefreshDashboards);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('refreshDashboards', handleRefreshDashboards);
    };
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const [users, slots, logs, reservations, invoices] = await Promise.all([
        userService.getAllUsers(),
        slotService.getAllSlots(),
        vehicleLogService.getAllLogs(),
        reservationService.getAllReservations(),
        billingService.getAllInvoices(),
      ]);

      // Calculate statistics
      const activeReservations = reservations.filter(r => r.status === 'ACTIVE').length;
      const physicallyOccupiedSlots = slots.filter(slot => slot.occupied).length;
      const reservedSlots = activeReservations;
      const availableSlots = slots.length - physicallyOccupiedSlots - reservedSlots;
      const totalRevenue = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + i.amount, 0);
      const pendingPayments = invoices.filter(i => i.status === 'UNPAID').length;

      setStats({
        totalUsers: users.length,
        totalSlots: slots.length,
        occupiedSlots: physicallyOccupiedSlots,
        availableSlots,
        totalLogs: logs.count,
        activeReservations,
        totalRevenue,
        pendingPayments,
      });

      // Recent activity (last 5 vehicle logs)
      const recentLogs = logs.logs.slice(-5).reverse();
      setRecentActivity(recentLogs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Slots',
      value: stats.totalSlots,
      icon: Car,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Available Slots',
      value: stats.availableSlots,
      icon: Car,
      color: 'bg-emerald-500',
      change: 'Ready for booking',
    },
    {
      title: 'Occupied Slots',
      value: stats.occupiedSlots,
      icon: Car,
      color: 'bg-yellow-500',
      change: `${stats.totalSlots > 0 ? ((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1) : 0}%`,
    },
    {
      title: 'Vehicle Logs',
      value: stats.totalLogs,
      icon: ClipboardList,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      title: 'Active Reservations',
      value: stats.activeReservations,
      icon: Calendar,
      color: 'bg-indigo-500',
      change: '+3%',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: Receipt,
      color: 'bg-emerald-500',
      change: '+15%',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500 font-medium">{card.change}</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
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

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Vehicle Activity</h3>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.logId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.vehicleNumber}</p>
                      <p className="text-sm text-gray-500">
                        {activity.exitTime ? 'Exited' : 'Entered'} • Slot {activity.slotId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.entryTime).toLocaleTimeString()}
                    </p>
                    {activity.duration && (
                      <p className="text-sm text-gray-500">Duration: {activity.duration}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Alerts</h3>
          <div className="space-y-4">
            {stats.pendingPayments > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Pending Payments</p>
                  <p className="text-sm text-yellow-600">{stats.pendingPayments} invoices pending payment</p>
                </div>
              </div>
            )}
            
            {stats.occupiedSlots / stats.totalSlots > 0.8 && (
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">High Occupancy</p>
                  <p className="text-sm text-red-600">Parking is {((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1)}% full</p>
                </div>
              </div>
            )}
            
            {stats.totalSlots === 0 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">No Parking Slots</p>
                  <p className="text-sm text-blue-600">Add parking slots to get started</p>
                </div>
              </div>
            )}

            {/* Manual Trigger Button for Testing */}
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-purple-800">Auto-Completion Testing</p>
                <p className="text-sm text-purple-600">Manually trigger reservation completion</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await reservationService.triggerAutoCompletion();
                    alert('Auto-completion triggered successfully!');
                    fetchDashboardData();
                  } catch (error) {
                    console.error('Error triggering auto-completion:', error);
                    alert('Error triggering auto-completion');
                  }
                }}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
              >
                Trigger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;