
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">EduPredict LMS</h1>
              <span className="ml-4 text-sm text-gray-300">
                {title}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                  3
                </Badge>
              </div>
              <span className="text-sm text-gray-300">
                Welcome, {user?.name}
              </span>
              <span className="text-xs bg-purple-600 text-purple-100 px-2 py-1 rounded-full capitalize">
                {user?.role}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Logout
              </Button>
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
