import React from 'react';
import { Users, GraduationCap, BookOpen, Settings, BarChart3, UserCheck, Shield, Database, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

//////////////////////newly added//////////////////////////////////
const sidebarItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
  { id: 'students', label: 'Student Management', icon: Users },
  { id: 'student-management', label: 'Student Data Management', icon: TrendingUp },
  { id: 'lecturers', label: 'Lecturer Management', icon: UserCheck },
  { id: 'courses', label: 'Course Management', icon: BookOpen }, // Added this line
  { id: 'verifications', label: 'User Verifications', icon: Shield },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

///////////////////////////////////////////////////////////////////////
const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'System statistics'
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      description: 'Manage student accounts'
    },
    {
      id: 'student-management',
      label: 'Student Data',
      icon: TrendingUp,
      description: 'Motivation & Attendance'
    },
    {
      id: 'lecturers',
      label: 'Lecturers',
      icon: GraduationCap,
      description: 'Manage lecturer accounts'
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      description: 'Course management'
    },
    {
      id: 'verifications',
      label: 'Verifications',
      icon: UserCheck,
      description: 'Pending verifications'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      description: 'User permissions'
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      description: 'Data management'
    },
    {
      id: 'system',
      label: 'System Settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-400" />
          Admin Panel
        </h2>
        <p className="text-sm text-gray-400 mt-1">System Administration</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;