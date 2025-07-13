// Event Manager to prevent duplicate event listeners
class EventManager {
  constructor() {
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // Initialize global event listeners once
  init() {
    if (this.isInitialized) return;
    
    // Create a single event listener for each event type
    const events = ['paymentSuccess', 'reservationUpdate', 'refreshDashboards'];
    
    events.forEach(eventType => {
      const handler = (event) => {
        // Notify all registered listeners for this event
        const listeners = this.listeners.get(eventType) || [];
        listeners.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error in event listener for ${eventType}:`, error);
          }
        });
      };
      
      window.addEventListener(eventType, handler);
      this.listeners.set(eventType, []);
    });
    
    this.isInitialized = true;
  }

  // Add event listener (prevents duplicates)
  addEventListener(eventType, callback) {
    if (!this.isInitialized) this.init();
    
    const listeners = this.listeners.get(eventType) || [];
    // Check if callback already exists
    if (!listeners.includes(callback)) {
      listeners.push(callback);
      this.listeners.set(eventType, listeners);
    }
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    const listeners = this.listeners.get(eventType) || [];
    const filteredListeners = listeners.filter(cb => cb !== callback);
    this.listeners.set(eventType, filteredListeners);
  }

  // Dispatch event
  dispatchEvent(eventType, detail = {}) {
    if (!this.isInitialized) this.init();
    
    window.dispatchEvent(new CustomEvent(eventType, { detail }));
  }

  // Clear all listeners
  clear() {
    this.listeners.clear();
  }
}

// Create singleton instance
const eventManager = new EventManager();

export default eventManager; 