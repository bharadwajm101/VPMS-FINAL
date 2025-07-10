import axios from 'axios';

const API_BASE_URL = 'http://localhost:8090/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  async login(email, password) {
    const response = await apiClient.post('/user/login', { email, password });
    return response.data;
  },

  async register(name, email, password) {
    const response = await apiClient.post('/user/register', { name, email, password });
    return response.data;
  },

  async getAllUsers() {
    const response = await apiClient.get('/user/all');
    // Backend returns { users: [...] }
    return response.data.users || [];
  },

  async getProfile() {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async getUserById(userId) {
    const response = await apiClient.get(`/user/${userId}`);
    // Backend returns { user: {...} }
    return response.data.user;
  },

  async updateUser(userId, userData) {
    const response = await apiClient.put(`/user/${userId}`, userData);
    // Backend returns { message, user: {...} }
    return response.data.user;
  },

  async deleteUser(userId) {
    await apiClient.delete(`/user/${userId}`);
  },

  async assignRole(userId, role) {
    const response = await apiClient.put(`/user/assign-role/${userId}?role=${role}`);
    return response.data.user;
  },

  async getUserByEmail(email) {
    const response = await apiClient.get(`/user/email/${encodeURIComponent(email)}`);
    return response.data;
  },
};

export const slotService = {
  async getAllSlots() {
    const response = await apiClient.get('/slots');
    // Backend returns { slots: [...] }
    return response.data.slots || [];
  },

  async getAvailableSlots() {
    const response = await apiClient.get('/slots/available');
    return response.data.slots || [];
  },

  async getAvailableSlotsByType(type) {
    const response = await apiClient.get(`/slots/available/type/${type}`);
    return response.data.slots || [];
  },

  async addSlot(slotData) {
    const response = await apiClient.post('/slots', slotData);
    return response.data.slot;
  },

  async updateSlot(slotId, slotData) {
    const response = await apiClient.put(`/slots/${slotId}`, slotData);
    return response.data.slot;
  },

  async updateSlotOccupancy(slotId, occupied) {
    const response = await apiClient.put(`/slots/slot/${slotId}`, { occupied });
    return response.data.slot;
  },

  async deleteSlot(slotId) {
    await apiClient.delete(`/slots/${slotId}`);
  },

  async getSlotById(slotId) {
    const response = await apiClient.get(`/slots/${slotId}`);
    return response.data.slot;
  },
};

export const vehicleLogService = {
  async getAllLogs() {
    const response = await apiClient.get('/vehicle-log');
    // Backend returns { logs: [...], count: n }
    return { logs: response.data.logs || [], count: response.data.count || 0 };
  },

  async getLogById(logId) {
    const response = await apiClient.get(`/vehicle-log/${logId}`);
    return response.data;
  },

  async getUserLogs(userId) {
    const response = await apiClient.get(`/vehicle-log/user/${userId}`);
    // Backend returns an array
    return response.data;
  },

  async recordEntry(entryData) {
    const response = await apiClient.post('/vehicle-log/entry', entryData);
    return response.data.log;
  },

  async recordExit(logId) {
    const response = await apiClient.post('/vehicle-log/exit', { logId });
    return response.data.log;
  },

  async updateLog(logId, logData) {
    const response = await apiClient.put(`/vehicle-log/${logId}`, logData);
    return response.data.log;
  },

  // Additional endpoints for comprehensive vehicle log management
  async getLogsByUserId(userId) {
    const response = await apiClient.get(`/vehicle-log/user/${userId}`);
    return response.data;
  },

  async getActiveLogs() {
    const response = await apiClient.get('/vehicle-log');
    const logs = response.data.logs || [];
    return logs.filter(log => !log.exitTime);
  },

  async getCompletedLogs() {
    const response = await apiClient.get('/vehicle-log');
    const logs = response.data.logs || [];
    return logs.filter(log => log.exitTime);
  },
};

export const reservationService = {
  async getAllReservations() {
    const response = await apiClient.get('/reservations');
    // Backend returns an array
    return response.data;
  },

  async getReservationById(reservationId) {
    const response = await apiClient.get(`/reservations/${reservationId}`);
    return response.data;
  },

  async getUserReservations(userId) {
    const response = await apiClient.get(`/reservations/user/${userId}`);
    // Backend returns an array
    return response.data;
  },

  async createReservation(reservationData) {
    const response = await apiClient.post('/reservations', reservationData);
    return response.data.reservation;
  },

  async updateReservation(reservationId, reservationData) {
    const response = await apiClient.put(`/reservations/${reservationId}`, reservationData);
    return response.data.reservation;
  },

  async updateReservationStatus(reservationId, status) {
    const response = await apiClient.put(`/reservations/${reservationId}/status`, { status });
    return response.data.reservation;
  },

  async cancelReservation(reservationId) {
    const response = await apiClient.delete(`/reservations/${reservationId}`);
    return response.data;
  },

  // Get reservations by user ID
  getReservationsByUser: async (userId) => {
    const response = await apiClient.get(`/reservations/user/${userId}`);
    return response.data;
  },

  // Manual trigger for auto-completion (ADMIN only)
  triggerAutoCompletion: async () => {
    const response = await apiClient.post('/reservations/trigger-completion');
    return response.data;
  },
};

export const billingService = {
  // Billing Service
  createInvoice: async (data) => {
    console.log('Billing API - Creating invoice with data:', data);
    console.log('Billing API - Request URL:', `${API_BASE_URL}/billing`);
    const response = await apiClient.post('/billing', data);
    console.log('Billing API - Create invoice response:', response.data);
    return response.data.data || response.data;
  },

  getInvoiceById: async (id) => {
    const response = await apiClient.get(`/billing/${id}`);
    return response.data.data || response.data;
  },

  getAllInvoices: async () => {
    console.log('Billing API - Fetching all invoices');
    const response = await apiClient.get('/billing');
    console.log('Billing API - Raw response:', response.data);
    const result = response.data.data || response.data;
    console.log('Billing API - Processed result:', result);
    return result;
  },

  getUserInvoices: async (userId) => {
    console.log('Billing API - Fetching user invoices for userId:', userId);
    const response = await apiClient.get(`/billing/user/${userId}`);
    console.log('Billing API - Raw user response:', response.data);
    const result = response.data.data || response.data;
    console.log('Billing API - Processed user result:', result);
    return result;
  },

  payInvoice: async (id, paymentRequest) => {
    console.log('Billing API - Paying invoice with ID:', id);
    console.log('Billing API - Payment request:', paymentRequest);
    console.log('Billing API - Request URL:', `${API_BASE_URL}/billing/${id}/pay`);
    const response = await apiClient.post(`/billing/${id}/pay`, paymentRequest);
    console.log('Billing API - Pay invoice response:', response.data);
    return response.data.data || response.data;
  },

  cancelInvoice: async (id) => {
    const response = await apiClient.post(`/billing/${id}/cancel`);
    return response.data.data || response.data;
  },
};

export default apiClient;