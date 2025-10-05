import React, { useEffect } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useWebSocket } from '../hooks/useWebSocket';

const NavbarWithWebSocket = ({ 
  currentScreen, 
  onNavigate, 
  user, 
  onLogout,
  baseURL = 'http://localhost:5000' // WebSocket server URL
}) => {
  const { isConnected, unreadCount, notifications } = useWebSocket(
    baseURL, 
    user?.token, 
    !!user?.token // Only connect if user is logged in
  );

  // Show connection status (optional - for debugging)
  useEffect(() => {
    if (isConnected) {
      console.log('WebSocket connected - notifications will update in real-time');
    }
  }, [isConnected]);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">MoringaDesk</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Button
                variant={currentScreen === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={currentScreen === "problems" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("/problems")}
              >
                Problems
              </Button>
              <Button
                variant={currentScreen === "solutions" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("/solutions")}
              >
                My Solutions
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* WebSocket Connection Status (optional) */}
            {process.env.NODE_ENV === 'development' && (
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'} />
            )}

            {/* Notifications with Real-time Updates */}
            <Button
              variant={currentScreen === "notifications" ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate("/notifications")}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("/profile")}
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{user?.name || 'User'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarWithWebSocket;
