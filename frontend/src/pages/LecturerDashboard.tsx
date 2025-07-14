
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MarksEntryModal from '@/components/MarksEntryModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

const LecturerDashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [studentRoster, setStudentRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  // Get current time for appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Fetch lecturer's courses
  useEffect(() => {
    if (user?.id) {
      fetchLecturerCourses();
      fetchAtRiskStudents();
    }
  }, [user]);

  // Fetch students when a course is selected
  useEffect(() => {
    if (selectedModule) {
      fetchCourseStudents(selectedModule);
    }
  }, [selectedModule]);

  const fetchLecturerCourses = async () => {
    try {
      console.log("🔍 Fetching courses for lecturer ID:", user.id);
      const response = await fetch(`/api/lecturer/courses/${user.id}`);
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📚 Courses data received:", data);
        setCourses(data);
      } else {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAtRiskStudents = async () => {
    try {
      const response = await fetch(`/api/lecturer/at-risk/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAtRiskStudents(data);
      }
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
    }
  };

  const fetchCourseStudents = async (courseId: string) => {
    try {
      const response = await fetch(`/api/lecturer/courses/${courseId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudentRoster(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch course students",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch course students",
        variant: "destructive"
      });
    }
  };

  const handleAddMarks = (student) => {
    setSelectedStudent(student);
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = async (studentId, marks) => {
    try {
      const response = await fetch('/api/lecturer/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: selectedModule,
          ...marks
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marks saved successfully"
        });
        // Refresh the student roster to show updated marks
        fetchCourseStudents(selectedModule);
        setIsMarksModalOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save marks",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Lecturer Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Lecturer Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.name || 'Lecturer'}! 👋
          </h2>
          <p className="text-purple-100">Welcome to your Teaching Excellence Dashboard. Monitor student progress and identify those who need additional support.</p>
        </div>

        {/* At-Risk Students Alert */}
        <Alert className="border-red-600 bg-red-900/20 border">
          <AlertTitle className="text-red-300">⚠️ Students At Risk</AlertTitle>
          <AlertDescription className="text-red-200">
            {atRiskStudents.length} students are predicted to be at risk of failing. Review their details below.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 text-white">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">My Courses</TabsTrigger>
            <TabsTrigger value="at-risk" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">At-Risk Students</TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">Grade Management</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer bg-gray-800 border-gray-700"
                      onClick={() => setSelectedModule(course.id.toString())}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-white">
                      <span>{course.course_code}</span>
                      {course.at_risk_count > 0 && (
                        <Badge className="bg-red-600 text-red-100">{course.at_risk_count} at risk</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-300">{course.course_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">{course.student_count}</div>
                    <div className="text-sm text-gray-300">Enrolled Students</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Credits: {course.credits} • {course.difficulty_level}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedModule && (
              <Card className="mt-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Student Roster - {courses.find(c => c.id.toString() === selectedModule)?.course_name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">Manage students and their grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {studentRoster.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{student.full_name}</div>
                          <div className="text-sm text-gray-400">{student.email}</div>
                          <div className="text-sm text-gray-400">
                            Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-blue-400">{student.current_grade}%</span>
                          <Button size="sm" variant="outline" className="bg-white-700 border-gray-600 text-white hover:bg-gray-700 hover:text-white">
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddMarks(student)}
                            className="bg-blue-600 hover:bg-blue-300 text-blue-50 hover:text-blue-700"
                          >
                            Add Marks
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="at-risk" className="space-y-4">
            {atRiskStudents.map((student) => (
              <Card key={student.id} className="border-red-600 bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-white">
                    <span>{student.full_name}</span>
                    <Badge className="bg-red-600 text-pink-100">Predicted: {student.predicted_grade}%</Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">Course: {student.course_code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-200">Risk Factors:</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-red-400 border-red-600">
                        {student.risk_factors}
                      </Badge>
                    </div>
                    <div className="pt-3">
                      <Button size="sm" className="mr-2 bg-blue-600 hover:bg-blue-700">Contact Student</Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">View Full Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Grade Entry System</CardTitle>
                <CardDescription className="text-gray-300">Enter and update student grades for all courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <p>Select a course from the "My Courses" tab to access grade entry.</p>
                  <p className="text-sm mt-2">You can add marks for quizzes, assignments, and exams.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <MarksEntryModal
          student={selectedStudent}
          isOpen={isMarksModalOpen}
          onClose={() => setIsMarksModalOpen(false)}
          onSave={handleSaveMarks}
        />
      </div>
    </DashboardLayout>
  );
};

export default LecturerDashboard;
