
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MarksEntryModal from '@/components/MarksEntryModal';
import AlertSystem from '@/components/AlertSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, TrendingDown, Users, Calendar } from 'lucide-react';

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
      } else {
        // Handle case where API returns error or no data
        console.log('No at-risk students found or API error');
        setAtRiskStudents([]);
      }
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
      setAtRiskStudents([]);
      toast({
        title: "Warning",
        description: "Unable to load at-risk students data. Please try again later.",
        variant: "destructive"
      });
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

        {/* Lecturer Alert System */}
        <AlertSystem userId={user?.id} userType="lecturer" />

        {/* At-Risk Students Alert */}
        {atRiskStudents.length > 0 && (
          <Alert className="border-red-600 bg-red-900/20 border">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-300">Students At Risk</AlertTitle>
            <AlertDescription className="text-red-200">
              {atRiskStudents.length} student{atRiskStudents.length > 1 ? 's are' : ' is'} predicted to be at risk of failing. Review their details in the "At-Risk Students" tab.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-white">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">My Courses</TabsTrigger>
            <TabsTrigger value="at-risk" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">At-Risk Students</TabsTrigger>
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
                            {/* Current Grade */}
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-400">{student.current_grade}%</div>
                              <div className="text-xs text-gray-300">Current</div>
                            </div>
                            
                            {/* Predicted Grade */}
                            {student.has_prediction && student.predicted_grade !== null ? (
                              <div className="text-center">
                                <div className={`text-lg font-bold ${
                                  student.predicted_grade >= 60 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {student.predicted_grade.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-300">Predicted</div>
                                <div className={`text-xs font-medium ${
                                  student.predicted_grade >= 60 ? 'text-green-300' : 'text-red-300'
                                }`}>
                                  {getGradeFromPercentage(student.predicted_grade)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="text-lg text-gray-500">--</div>
                                <div className="text-xs text-gray-400">Predicted</div>
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

          <TabsContent value="at-risk" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">At-Risk Students</h3>
                <Badge className="bg-red-600 text-white">{atRiskStudents.length}</Badge>
              </div>
            </div>

            {atRiskStudents.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No At-Risk Students</h3>
                  <p className="text-gray-400 text-center">
                    Great news! All your students are performing well. No students are currently at risk of failing.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {atRiskStudents.map((student) => (
                  <Card key={student.id} className="border-red-600/30 bg-gray-800 border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-3 text-white mb-2">
                            <span>{student.full_name}</span>
                          </CardTitle>
                          <CardDescription className="text-gray-300 flex items-center gap-2">
                            <span>Course: {student.course_name} ({student.course_code})</span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Student Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {student.attendance && (
                            <div className="space-y-1">
                              <div className="text-gray-400">Attendance</div>
                              <div className={`font-medium ${
                                student.attendance >= 75 ? 'text-green-400' : 
                                student.attendance >= 60 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {student.attendance}%
                              </div>
                            </div>
                          )}
                          
                          {student.enrollment_date && (
                            <div className="space-y-1">
                              <div className="text-gray-400">Enrolled</div>
                              <div className="text-white font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(student.enrollment_date).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Risk Factors */}
                        {student.risk_factors && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-200">Risk Factors:</div>
                            <div className="flex flex-wrap gap-2">
                              {student.risk_factors.split(',').map((factor, index) => (
                                <Badge 
                                  key={index}
                                  variant="outline" 
                                  className="text-red-400 border-red-600/50 bg-red-900/20"
                                >
                                  {factor.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
