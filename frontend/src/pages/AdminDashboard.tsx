import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminSidebar from '@/components/AdminSidebar';
import CourseManagement from '@/components/CourseManagement';
import StudentManagement from '@/components/StudentManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AlertSystem from "@/components/AlertSystem";


// TypeScript interfaces
interface PendingUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  id_card: string;
}

interface Lecturer {
  id: number;
  username: string;
  full_name: string;
  email: string;
  course_count: number;
}

interface SystemStats {
  totalStudents: number;
  totalLecturers: number;
  activeCourses: number;
  pendingVerifications: number;
}

interface PendingRegistration {
  id: number;
  fullName: string;
  email: string;
  role: string;
  idCard: string;
  submittedDate: string;
  department: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Add state for course teacher quality ratings
  const [courseTeacherQuality, setCourseTeacherQuality] = useState<{[key: string]: number}>({
    'Computer Science': 8.5,
    'Data Structures & Algorithms': 7.2,
    'Web Development': 9.1
  });

  // Your original user verification state
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalStudents: 0,
    totalLecturers: 0,
    activeCourses: 0,
    pendingVerifications: 0
  });

  const [allLecturers, setAllLecturers] = useState<Lecturer[]>([]);

  // Your original user verification useEffect (unchanged)
  useEffect(() => {
    // Fetch pending users
    fetch("http://localhost:5000/api/admin/pending-users")
      .then((res) => res.json())
      .then((data) => {
        setPendingUsers(data);
        // Update system stats with the actual count
        setSystemStats(prev => ({
          ...prev,
          pendingVerifications: data.length
        }));
      })
      .catch((error) => console.error("Error fetching users:", error));

    // Fetch system statistics
    fetch("http://localhost:5000/api/admin/system-stats")
      .then((res) => res.json())
      .then((data) => {
        setSystemStats(prev => ({
          ...prev,
          ...data
        }));
      })
      .catch((error) => console.error("Error fetching system stats:", error));

    // Fetch lecturers
    fetch("http://localhost:5000/api/admin/lecturers-management")
      .then((res) => res.json())
      .then((data) => {
        setAllLecturers(data);
      })
      .catch((error) => console.error("Error fetching lecturers:", error));
  }, []);

  // Your original handleAction function (unchanged)
  const handleAction = async (id: number, action: string): Promise<void> => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this user?`
    );
    if (!confirmAction) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/${action}/${id}`,
        { method: "POST" }
      );
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setPendingUsers((prev) => prev.filter((user) => user.id !== id));
        // Update system stats
        setSystemStats(prev => ({
          ...prev,
          pendingVerifications: prev.pendingVerifications - 1
        }));
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error processing user:", error);
    }
  };

  const handleTeacherQualityChange = (course: string, value: number) => {
    setCourseTeacherQuality(prev => ({
      ...prev,
      [course]: value
    }));
    toast({
      title: "Teacher Quality Updated",
      description: `Teacher quality for ${course} updated to ${value}`,
    });
  };
  

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">System Administration</h2>
              <p className="text-blue-100">Manage users, courses, and system configurations.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{systemStats.totalStudents}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Total Lecturers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{systemStats.totalLecturers}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Active Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{systemStats.activeCourses}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-400">{systemStats.pendingVerifications}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'student-management':
        return <StudentManagement />;

      case 'lecturers':
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">All Lecturers</CardTitle>
              <CardDescription className="text-gray-300">Manage lecturer accounts and course assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allLecturers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading lecturers...
                  </div>
                ) : (
                  allLecturers.map((lecturer) => (
                    <div key={lecturer.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{lecturer.full_name}</div>
                        <div className="text-sm text-gray-400">{lecturer.email}</div>
                        <div className="text-sm text-gray-400">Username: {lecturer.username}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-purple-400">{lecturer.course_count} courses</span>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );
      
        case 'courses':
          return <CourseManagement />;
          
      case 'verifications':
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Pending User Verifications
              </CardTitle>
              <CardDescription className="text-gray-300">
                Review and approve or reject user registration requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No Pending Verifications
                  </h3>
                  <p className="text-gray-400">
                    All user registrations have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 border border-gray-700 rounded-lg bg-gray-750 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-medium text-white text-lg">{user.full_name}</h3>
                            <Badge 
                              variant="outline" 
                              className={`border-gray-600 capitalize ${
                                user.role.toLowerCase() === 'lecturer' 
                                  ? 'text-purple-400 border-purple-400' 
                                  : 'text-blue-400 border-blue-400'
                              }`}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="text-gray-300">
                              <span className="text-gray-400 font-medium">Email:</span> {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 font-medium">ID Document:</span> 
                              <a
                                href={`http://localhost:5000/uploads/${user.id_card}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View ID
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(user.id, "approve")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleAction(user.id, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'alerts':
        return <AlertSystem role="admin" />;

      default:
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Coming Soon</CardTitle>
              <CardDescription className="text-gray-300">This section is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>This feature will be implemented in the next phase.</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;