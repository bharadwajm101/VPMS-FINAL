import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ClipboardList, 
  Calendar, 
  Receipt,
  ArrowRightLeft,
  User
} from 'lucide-react';

const Navigation = ({ currentView, onViewChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'Profile', icon: User },
    ];

    switch (user?.role) {
      case 'ADMIN':
        return [
          ...commonItems,
          { id: 'slot-map', label: 'Parking Slot Map', icon: Car },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'slots', label: 'Slot Management', icon: Car },
          { id: 'vehicle-logs', label: 'Vehicle Logs', icon: ClipboardList },
          { id: 'reservations', label: 'Reservations', icon: Calendar },
          { id: 'billing', label: 'Billing', icon: Receipt },
        ];
      case 'STAFF':
        return [
          ...commonItems,
          { id: 'slot-map', label: 'Parking Slot Map', icon: Car },
          { id: 'slots', label: 'Slot Management', icon: Car },
          { id: 'vehicle-entry', label: 'Vehicle Entry/Exit', icon: ArrowRightLeft },
          { id: 'vehicle-logs', label: 'Vehicle Logs', icon: ClipboardList },
          { id: 'billing', label: 'Billing', icon: Receipt },
        ];
      case 'CUSTOMER':
        return [
          ...commonItems,
          { id: 'slot-map', label: 'Parking Slot Map', icon: Car },
          { id: 'available-slots', label: 'Available Slots', icon: Car },
          { id: 'my-reservations', label: 'My Reservations', icon: Calendar },
          { id: 'my-bills', label: 'My Bills', icon: Receipt },
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-sm border-r min-h-screen w-64">
      <div className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;