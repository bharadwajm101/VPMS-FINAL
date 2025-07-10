import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Car, Shield, Users, Clock } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: <Car className="w-6 h-6" />,
      title: 'Smart Parking Management',
      description: 'Efficient slot allocation and real-time availability tracking',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Access Control',
      description: 'Role-based permissions for admin, staff, and customers',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'User-Friendly Interface',
      description: 'Intuitive design for seamless parking experience',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-Time Updates',
      description: 'Instant notifications and live parking status updates',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left side - Branding and features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="bg-blue-600 rounded-full p-3 mr-4">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">ParkManager Pro</h1>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                The complete solution for modern parking management. Streamline operations, 
                enhance user experience, and maximize efficiency with our comprehensive platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-blue-600 mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex justify-center lg:justify-end">
            {isLogin ? (
              <LoginForm onToggleForm={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleForm={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;