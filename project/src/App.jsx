import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import UserManagement from './components/admin/UserManagement.jsx';
import SlotManagement from './components/admin/SlotManagement.jsx';
import VehicleEntry from './components/staff/VehicleEntry.jsx';
import VehicleLogs from './components/common/VehicleLogs.jsx';
import Profile from './components/common/Profile';
import ReservationManagement from './components/admin/ReservationManagement.jsx';
import BillingManagement from './components/admin/BillingManagement.jsx';
import AvailableSlots from './components/customer/AvailableSlots.jsx';
import MyReservations from './components/customer/MyReservations.jsx';
import MyVehicles from './components/customer/MyVehicles.jsx';
import MyBills from './components/customer/MyBills.jsx';
import ParkingSlotMap from './components/ParkingSlotMap.jsx';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'users':
        return <UserManagement />;
      case 'slots':
        return <SlotManagement />;
      case 'slot-map':
        return <ParkingSlotMap />;
      case 'vehicle-entry':
        return <VehicleEntry />;
      case 'vehicle-logs':
        return <VehicleLogs />;
      case 'reservations':
        return <ReservationManagement />;
      case 'billing':
        return <BillingManagement />;
      case 'available-slots':
        return <AvailableSlots />;
      case 'my-reservations':
        return <MyReservations />;
      case 'my-vehicles':
        return <MyVehicles />;
      case 'my-bills':
        return <MyBills />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;