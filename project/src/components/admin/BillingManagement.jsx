import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Receipt, User, Calendar, CreditCard, Search, Filter, Eye, DollarSign } from 'lucide-react';
import { billingService, userService } from '../../services/api';

const BillingManagement = () => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchData, 30000);
    
    // Listen for payment success events to refresh data
    const handlePaymentSuccess = (event) => {
      console.log('BillingManagement - Payment success detected, refreshing data...', event.detail);
      fetchData();
    };
    
    const handleRefreshDashboards = () => {
      console.log('BillingManagement - Manual refresh triggered');
      fetchData();
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('refreshDashboards', handleRefreshDashboards);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('refreshDashboards', handleRefreshDashboards);
    };
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('BillingManagement - Fetching data...');
      const [invoicesData, usersData] = await Promise.all([
        billingService.getAllInvoices(),
        userService.getAllUsers(),
      ]);
      console.log('BillingManagement - Received invoices:', invoicesData);
      setInvoices(invoicesData);
      setUsers(usersData);
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

  const handlePayInvoice = async (invoiceId) => {
    try {
      // Pay the invoice with proper PaymentRequestDTO format
      const paymentRequest = {
        paymentMethod: 'CASH'
      };
      await billingService.payInvoice(invoiceId, paymentRequest);
      await fetchData();
    } catch (error) {
      console.error('Error paying invoice:', error);
    }
  };

  const handleCancelInvoice = async (invoiceId) => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await billingService.cancelInvoice(invoiceId);
      await fetchData();
    } catch (error) {
      console.error('Error canceling invoice:', error);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = getUserName(invoice.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceId.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || invoice.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'ALL' || invoice.paymentMethod === filterPaymentMethod;
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    unpaid: invoices.filter(i => i.status === 'UNPAID').length,
    cancelled: invoices.filter(i => i.status === 'CANCELLED').length,
    totalRevenue: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'CASH':
        return 'bg-blue-100 text-blue-800';
      case 'UPI':
        return 'bg-purple-100 text-purple-800';
      case 'CARD':
        return 'bg-green-100 text-green-800';
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing Management</h1>
        <p className="text-gray-600">Manage invoices and payments</p>
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Invoices</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-600">Paid</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.unpaid}</div>
          <div className="text-sm text-gray-600">Unpaid</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by user name or invoice ID..."
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
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </select>
      </div>
      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">#{invoice.invoiceId}</div>
                        <div className="text-sm text-gray-500">{invoice.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getUserName(invoice.userId)}</div>
                    <div className="text-sm text-gray-500">ID: {invoice.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">${invoice.amount.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(invoice.paymentMethod)}`}>{invoice.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(invoice.timestamp).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(invoice.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => setSelectedInvoice(invoice)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      {invoice.status === 'UNPAID' && (
                        <button onClick={() => handlePayInvoice(invoice.invoiceId)} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"><CreditCard className="w-4 h-4" /></button>
                      )}
                      {invoice.status === 'UNPAID' && (
                        <button onClick={() => handleCancelInvoice(invoice.invoiceId)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-600">Invoice ID:</span><span className="font-medium">#{selectedInvoice.invoiceId}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">User:</span><span className="font-medium">{getUserName(selectedInvoice.userId)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{selectedInvoice.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-medium">${selectedInvoice.amount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Payment Method:</span><span className={`px-2 py-1 text-xs rounded-full ${getPaymentMethodColor(selectedInvoice.paymentMethod)}`}>{selectedInvoice.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedInvoice.status)}`}>{selectedInvoice.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium">{new Date(selectedInvoice.timestamp).toLocaleString()}</span></div>
              {selectedInvoice.reservationId && (<div className="flex justify-between"><span className="text-gray-600">Reservation ID:</span><span className="font-medium">#{selectedInvoice.reservationId}</span></div>)}
              {selectedInvoice.logId && (<div className="flex justify-between"><span className="text-gray-600">Log ID:</span><span className="font-medium">#{selectedInvoice.logId}</span></div>)}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedInvoice(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement; 