import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';

interface PendingUser {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'lecturer';
  idPhoto: string;
  submittedAt: string;
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    {
      id: '1',
      fullName: 'John Smith',
      email: 'john.smith@university.edu',
      role: 'student',
      idPhoto: '/api/placeholder/100/100',
      submittedAt: '2025-05-30T10:00:00Z'
    },
    {
      id: '2',
      fullName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      role: 'lecturer',
      idPhoto: '/api/placeholder/100/100',
      submittedAt: '2025-05-30T09:30:00Z'
    },
    {
      id: '3',
      fullName: 'Mike Davis',
      email: 'mike.davis@university.edu',
      role: 'student',
      idPhoto: '/api/placeholder/100/100',
      submittedAt: '2025-05-30T08:15:00Z'
    }
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pending-requests', label: 'Pending Requests', icon: Clock, badge: pendingUsers.length },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'courses', label: 'Course Management', icon: BookOpen },
    { id: 'verified-users', label: 'Verified Users', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleApproveUser = (userId: string) => {
    setPendingUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "User Approved",
      description: "User has been successfully approved and can now access the system.",
      variant: "default"
    });
  };

  const handleRejectUser = (userId: string) => {
    setPendingUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "User Rejected",
      description: "User registration has been rejected.",
      variant: "destructive"
    });
  };

  const handleLogout = () => {
    // Add logout logic here
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default"
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600">EduPredict LMS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <Badge variant={isActive ? "secondary" : "default"} className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pending Requests Section */}
      {activeSection === 'pending-requests' && (
        <div className="p-4 border-t border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Registrations</h3>
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending requests</p>
            ) : (
              pendingUsers.map((user) => (
                <Card key={user.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.idPhoto} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(user.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(user.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectUser(user.id)}
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;