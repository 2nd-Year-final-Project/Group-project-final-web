
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StudentDetailsModal from '@/components/StudentDetailsModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const systemStats = {
    totalStudents: 1247,
    totalLecturers: 81,
    activeCourses: 156,
    pendingVerifications: 12
  };

  const allStudents = [
    { id: '1', name: 'Akila Fernando', email: 'AkilaF@university.edu', course: 'Computer Science', attendance: 85, motivation: 7, teacherQuality: 8 },
    { id: '2', name: 'Hiruna Mendis', email: 'HirunaM@university.edu', course: 'Computer Science', attendance: 92, motivation: 9, teacherQuality: 9 },
    { id: '3', name: 'Anujaya Jayanath', email: 'AnujayaJ@university.edu', course: 'Computer Science', attendance: 78, motivation: 6, teacherQuality: 7 },
    { id: '4', name: 'Renuja Sathnidu', email: 'RenujaS@university.edu', course: 'Computer Science', attendance: 95, motivation: 8, teacherQuality: 9 },
  ];

  const allLecturers = [
    { id: '1', name: 'Prof. N. G. J.Dias', email: 'ngjdias@kln.ac.lk', department: 'Computer Science', courses: 3 },
    { id: '2', name: 'Dr. Rasika Rajapaksha', email: 'rasikar@kln.ac.lk', department: 'Computer Science', courses: 2 },
    { id: '3', name: 'Prof. Dhammika weerasinghe', email: 'hesiri@kln.ac.lk', department: 'Computer Science', courses: 4 },
  ];

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudentData = (studentId, data) => {
    console.log('Saving data for student:', studentId, data);
    // Here you would typically update the backend
  };

  return (
    <DashboardLayout title="Admin Dashboard">
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

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="students" className="data-[state=active]:bg-gray-700">All Students</TabsTrigger>
            <TabsTrigger value="lecturers" className="data-[state=active]:bg-gray-700">All Lecturers</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-gray-700">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">All Students</CardTitle>
                <CardDescription className="text-gray-300">Click on a student to input administrative data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleStudentClick(student)}
                    >
                      <div>
                        <div className="font-medium text-white">{student.name}</div>
                        <div className="text-sm text-gray-400">{student.email}</div>
                        <div className="text-sm text-gray-400">Course: {student.course}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          Attendance: {student.attendance}%
                        </Badge>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lecturers" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">All Lecturers</CardTitle>
                <CardDescription className="text-gray-300">Manage lecturer accounts and course assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allLecturers.map((lecturer) => (
                    <div key={lecturer.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{lecturer.name}</div>
                        <div className="text-sm text-gray-400">{lecturer.email}</div>
                        <div className="text-sm text-gray-400">Department: {lecturer.department}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-purple-400">{lecturer.courses} courses</span>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
                <CardDescription className="text-gray-300">Manage system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>System configuration panel will be implemented in the next phase.</p>
                  <p className="text-sm mt-2">This will include academic term settings, grading scales, and more.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <StudentDetailsModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStudentData}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
