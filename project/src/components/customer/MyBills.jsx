import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Receipt, CreditCard, Calendar, DollarSign, Filter, Eye } from 'lucide-react';
import { billingService } from '../../services/api';

const MyBills = () => {
  const { token, user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [selectedInvoiceForUpi, setSelectedInvoiceForUpi] = useState(null);

  useEffect(() => {
    fetchInvoices();
    
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchInvoices, 30000);
    
    return () => clearInterval(interval);
  }, [token, user]);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await billingService.getUserInvoices(user.id);
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId, paymentMethod) => {
    try {
      setPaymentLoading(true);
      
      // For UPI payment, show UPI modal first
      if (paymentMethod === 'UPI') {
        setSelectedInvoiceForUpi(invoiceId);
        setShowUpiModal(true);
        setPaymentLoading(false);
        return;
      }
      
      // Pay the invoice with proper PaymentRequestDTO format
      const paymentRequest = {
        paymentMethod: paymentMethod
      };
      await billingService.payInvoice(invoiceId, paymentRequest);
      
      // Add 3-second buffer for payment success
      setTimeout(() => {
        setMessage('Payment successful!');
        fetchInvoices();
      }, 3000);
      
    } catch (error) {
      setMessage('Payment failed. Please try again.');
      console.error('Error paying invoice:', error);
      setPaymentLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!upiId.trim()) {
      setMessage('Please enter a valid UPI ID');
      return;
    }

    try {
      setPaymentLoading(true);
      setShowUpiModal(false);
      
      // Pay the invoice with proper PaymentRequestDTO format
      const paymentRequest = {
        paymentMethod: 'UPI'
      };
      await billingService.payInvoice(selectedInvoiceForUpi, paymentRequest);
      
      // Add 3-second buffer for payment success
      setTimeout(() => {
        setMessage(`UPI Payment successful! UPI ID: ${upiId}`);
        setUpiId('');
        setSelectedInvoiceForUpi(null);
        fetchInvoices();
      }, 3000);
      
    } catch (error) {
      setMessage('Payment failed. Please try again.');
      console.error('Error paying invoice:', error);
      setPaymentLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'ALL' || invoice.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'ALL' || invoice.paymentMethod === filterPaymentMethod;
    return matchesStatus && matchesPaymentMethod;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    unpaid: invoices.filter(i => i.status === 'UNPAID').length,
    totalPaid: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
    totalUnpaid: invoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0),
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Bills</h1>
        <p className="text-gray-600">View and manage your parking bills and payments</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Bills</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-600">Paid Bills</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.unpaid}</div>
          <div className="text-sm text-gray-600">Unpaid Bills</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">${stats.totalPaid.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Paid</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-600">${stats.totalUnpaid.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Outstanding</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Bills List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.invoiceId} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Invoice #{invoice.invoiceId}</h3>
                  <p className="text-sm text-gray-500">{invoice.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Method:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPaymentMethodColor(invoice.paymentMethod)}`}>
                  {invoice.paymentMethod}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(invoice.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{new Date(invoice.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {invoice.status === 'UNPAID' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePayInvoice(invoice.invoiceId, 'CASH')}
                    disabled={paymentLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    Pay with Cash
                  </button>
                  <button
                    onClick={() => handlePayInvoice(invoice.invoiceId, 'UPI')}
                    disabled={paymentLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    Pay with UPI
                  </button>
                  <button
                    onClick={() => handlePayInvoice(invoice.invoiceId, 'CARD')}
                    disabled={paymentLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    Pay with Card
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bills Found</h3>
          <p className="text-gray-500">
            {filterStatus === 'ALL' 
              ? 'You have no bills yet.' 
              : `No ${filterStatus.toLowerCase()} bills found.`}
          </p>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice ID:</span>
                <span className="font-medium">#{selectedInvoice.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{selectedInvoice.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${selectedInvoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPaymentMethodColor(selectedInvoice.paymentMethod)}`}>
                  {selectedInvoice.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(selectedInvoice.timestamp).toLocaleString()}</span>
              </div>
              {selectedInvoice.reservationId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reservation ID:</span>
                  <span className="font-medium">#{selectedInvoice.reservationId}</span>
                </div>
              )}
              {selectedInvoice.logId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Log ID:</span>
                  <span className="font-medium">#{selectedInvoice.logId}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
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
                  disabled={paymentLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills; 