
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MarksEntryModal from '@/components/MarksEntryModal';
import LecturerDashboardAlerts from '@/components/LecturerDashboardAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

const LecturerDashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
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

  // Convert percentage to grade letter (matching student dashboard logic)
  const getGradeFromPercentage = (percentage: number) => {
    if (percentage >= 85) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 65) return "A-";
    if (percentage >= 60) return "B+";
    if (percentage >= 55) return "B";
    if (percentage >= 50) return "B-";
    if (percentage >= 45) return "C+";
    if (percentage >= 40) return "C";
    if (percentage >= 35) return "C-";
    if (percentage >= 30) return "D+";
    if (percentage >= 25) return "D";
    return "E";
  };

  // Fetch lecturer's courses
  useEffect(() => {
    if (user?.id) {
      fetchLecturerCourses();
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
    } catch (fetchError) {
      console.error('Error fetching course students:', fetchError);
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
    } catch (saveError) {
      console.error('Error saving marks:', saveError);
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

        {/* Real-Time At-Risk Student Alerts */}
        <LecturerDashboardAlerts lecturerId={user?.id} />

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-gray-800 text-white">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">My Courses</TabsTrigger>
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
                  <CardDescription className="text-gray-300">
                    Manage students and their grades. AI predictions are shown when available for students.
                  </CardDescription>
                  {/* Prediction Summary */}
                  {studentRoster.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-600/30">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">
                          AI Predictions Available: {studentRoster.filter(s => s.has_prediction).length} of {studentRoster.length} students
                        </span>
                        <span className="text-purple-400">
                          {Math.round((studentRoster.filter(s => s.has_prediction).length / studentRoster.length) * 100)}% coverage
                        </span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {studentRoster.map((student) => (
                      <div key={student.id} className="p-4 border border-gray-700 rounded-lg bg-gray-750">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-white">{student.full_name}</div>
                            <div className="text-sm text-gray-400">{student.email}</div>
                            <div className="text-sm text-gray-400">
                              Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {/* Predicted Grade Only */}
                            {student.has_prediction && student.predicted_grade !== null ? (
                              <div className="text-center">
                                <div className={`text-2xl font-extrabold ${
                                  student.predicted_grade >= 60 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {getGradeFromPercentage(student.predicted_grade)}
                                </div>
                                <div className={`text-xs font-medium ${
                                  student.predicted_grade >= 60 ? 'text-green-200' : 'text-red-200'
                                }`}>
                                  {student.predicted_grade.toFixed(1)}%
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="text-2xl text-gray-500 font-extrabold">--</div>
                                <div className="text-xs text-gray-400">N/A</div>
                              </div>
                            )}
                            
                            {/* Action Button */}
                            <Button 
                              size="sm" 
                              onClick={() => handleAddMarks(student)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {(student.quiz1 !== null || student.quiz2 !== null || student.assignment1 !== null || student.assignment2 !== null || student.midterm !== null) ? 'Edit Marks' : 'Add Marks'}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Marks Display */}
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="text-sm font-bold text-blue-400">{student.quiz1 !== null ? student.quiz1 : 'Not Set'}</div>
                            <div className="text-xs text-gray-300">Quiz 1</div>
                          </div>
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="text-sm font-bold text-blue-400">{student.quiz2 !== null ? student.quiz2 : 'Not Set'}</div>
                            <div className="text-xs text-gray-300">Quiz 2</div>
                          </div>
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="text-sm font-bold text-purple-400">{student.assignment1 !== null ? student.assignment1 : 'Not Set'}</div>
                            <div className="text-xs text-gray-300">Assign 1</div>
                          </div>
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="text-sm font-bold text-purple-400">{student.assignment2 !== null ? student.assignment2 : 'Not Set'}</div>
                            <div className="text-xs text-gray-300">Assign 2</div>
                          </div>
                          <div className="text-center p-2 bg-gray-600 rounded">
                            <div className="text-sm font-bold text-green-400">{student.midterm !== null ? student.midterm : 'Not Set'}</div>
                            <div className="text-xs text-gray-300">Midterm</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
