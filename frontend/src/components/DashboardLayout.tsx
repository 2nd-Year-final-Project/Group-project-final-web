
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  User,
  GraduationCap
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({ title: "Logged out successfully" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 p-6 border-sidebar-border">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-bold text-blue-400">EduTrack</h1>
            </div>
            <div className="flex items-center space-x-6">
              {/* Notification Bell */}
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                  3
                </Badge>
              </div>
              
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 border-l border-gray-600 pl-6">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user?.email}
                  </div>
                </div>
                
                {/* Role Badge */}
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 py-1 font-medium capitalize"
                >
                  {user?.role}
                </Badge>
                
                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
