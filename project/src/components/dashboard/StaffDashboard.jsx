import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  ArrowRightLeft, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { 
  slotService, 
  vehicleLogService,
  userService,
  billingService
} from '../../services/api';
import ParkingSlotMap from '../ParkingSlotMap';

const StaffDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
    availableSlots: 0,
    recentEntries: 0,
    activeVehicles: 0,
    totalUsers: 0,
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Listen for payment success events to refresh dashboard
    const handlePaymentSuccess = (event) => {
      console.log('StaffDashboard - Payment success detected, refreshing data...', event.detail);
      fetchDashboardData();
    };
    
    const handleRefreshDashboards = () => {
      console.log('StaffDashboard - Manual refresh triggered');
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
    if (!token) return;

    try {
      setLoading(true);
      
      const [slots, logs, users, invoices] = await Promise.all([
        slotService.getAllSlots(),
        vehicleLogService.getAllLogs(),
        userService.getAllUsers(),
        billingService.getAllInvoices(),
      ]);

      const occupiedSlots = slots.filter(slot => slot.occupied).length;
      const availableSlots = slots.length - occupiedSlots;
      const activeVehicles = logs.logs.filter(log => !log.exitTime).length;
      const recentEntries = logs.logs.filter(log => {
        const entryTime = new Date(log.entryTime);
        const now = new Date();
        const timeDiff = now.getTime() - entryTime.getTime();
        return timeDiff < 24 * 60 * 60 * 1000; // Last 24 hours
      }).length;

      // Calculate billing statistics
      console.log('StaffDashboard - Processing invoices:', invoices);
      const paidBills = invoices.filter(invoice => invoice.status === 'PAID').length;
      const unpaidBills = invoices.filter(invoice => invoice.status === 'UNPAID').length;
      const totalRevenue = invoices
        .filter(invoice => invoice.status === 'PAID')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      
      console.log('StaffDashboard - Billing stats:', { totalBills: invoices.length, paidBills, unpaidBills, totalRevenue });

      setStats({
        totalSlots: slots.length,
        occupiedSlots,
        availableSlots,
        recentEntries,
        activeVehicles,
        totalUsers: users.length,
        totalBills: invoices.length,
        paidBills,
        unpaidBills,
        totalRevenue,
      });

      // Get recent logs for activity feed
      setRecentLogs(logs.logs.slice(-5).reverse());
      
      // Get recent users (last 5 registered)
      setRecentUsers(users.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Slots',
      value: stats.totalSlots,
      icon: Car,
      color: 'bg-blue-500',
      change: 'Available now',
    },
    {
      title: 'Occupied Slots',
      value: stats.occupiedSlots,
      icon: Car,
      color: 'bg-red-500',
      change: `${stats.totalSlots > 0 ? ((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1) : 0}% full`,
    },
    {
      title: 'Available Slots',
      value: stats.availableSlots,
      icon: Car,
      color: 'bg-green-500',
      change: 'Ready for parking',
    },
    {
      title: 'Active Vehicles',
      value: stats.activeVehicles,
      icon: Clock,
      color: 'bg-yellow-500',
      change: 'Currently parked',
    },
    {
      title: 'Total Bills',
      value: stats.totalBills,
      icon: Receipt,
      color: 'bg-purple-500',
      change: `${stats.paidBills} paid, ${stats.unpaidBills} unpaid`,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: 'From paid invoices',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Vehicle Activity</h3>
          <div className="space-y-4">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.logId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full p-2 ${log.exitTime ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {log.exitTime ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.vehicleNumber}</p>
                      <p className="text-sm text-gray-500">
                        {log.exitTime ? 'Exited' : 'Entered'} • Slot {log.slotId} • {log.slotType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(log.entryTime).toLocaleTimeString()}
                    </p>
                    {log.duration && (
                      <p className="text-sm text-gray-500">Duration: {log.duration}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
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
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/vehicle-entry'}
              className="w-full flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5" />
              <span className="font-medium">Vehicle Entry/Exit</span>
            </button>
            <button 
              onClick={() => window.location.href = '/slots'}
              className="w-full flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg transition-colors"
            >
              <Car className="w-5 h-5" />
              <span className="font-medium">Manage Slots</span>
            </button>
            <button 
              onClick={() => window.location.href = '/vehicle-logs'}
              className="w-full flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">View Vehicle Logs</span>
            </button>
            <button 
              onClick={() => window.location.href = '/users'}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">View Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status and Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">System Online</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Real-time Updates</p>
                <p className="text-sm text-gray-500">Live slot tracking active</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`rounded-full p-2 ${stats.availableSlots > 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <AlertCircle className={`w-5 h-5 ${stats.availableSlots > 0 ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Parking Status</p>
                <p className="text-sm text-gray-500">
                  {stats.availableSlots > 0 ? 'Spaces available' : 'Nearly full'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;