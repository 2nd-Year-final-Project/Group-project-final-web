
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MarksEntryModal from '@/components/MarksEntryModal';
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
  const [courseAtRiskStudents, setCourseAtRiskStudents] = useState([]);
  const [selectedCourseTab, setSelectedCourseTab] = useState('roster');
  const [totalAtRiskStudents, setTotalAtRiskStudents] = useState(0);
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

  // Get risk level badge colors
  const getRiskLevelColor = (riskLevel: string) => {
    if (riskLevel === 'critical') return 'bg-red-600 text-red-100';
    if (riskLevel === 'high') return 'bg-orange-600 text-orange-100';
    return 'bg-yellow-600 text-yellow-100';
  };

  // Get prediction percentage color
  const getPredictionColor = (percentage: number) => {
    if (percentage >= 50) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Fetch lecturer's courses and at-risk students
  useEffect(() => {
    if (user?.id) {
      fetchLecturerCourses();
      fetchTotalAtRiskStudents();
    }
  }, [user]);

  const fetchTotalAtRiskStudents = async () => {
    try {
      const response = await fetch(`/api/alerts/lecturer/${user.id}/at-risk`);
      if (response.ok) {
        const data = await response.json();
        setTotalAtRiskStudents(data.totalAtRisk || 0);
      } else {
        setTotalAtRiskStudents(0);
      }
    } catch (error) {
      console.error('Error fetching total at-risk students:', error);
      setTotalAtRiskStudents(0);
    }
  };

  // Fetch students when a course is selected
  useEffect(() => {
    if (selectedModule) {
      fetchCourseStudents(selectedModule);
      fetchCourseAtRiskStudents(selectedModule);
    }
  }, [selectedModule]);

  const fetchCourseAtRiskStudents = async (courseId: string) => {
    try {
      const response = await fetch(`/api/alerts/lecturer/${user.id}/course/${courseId}/at-risk`);
      if (response.ok) {
        const data = await response.json();
        setCourseAtRiskStudents(data.atRiskStudents);
      } else {
        setCourseAtRiskStudents([]);
      }
    } catch (error) {
      console.error('Error fetching course at-risk students:', error);
      setCourseAtRiskStudents([]);
    }
  };

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
        fetchCourseAtRiskStudents(selectedModule);
        // Refresh total at-risk count as predictions may have changed
        fetchTotalAtRiskStudents();
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
        {/* Professional Welcome Section */}
        <div className="bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 rounded-xl p-8 border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(user?.name || 'L').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {getGreeting()}, {user?.name || 'Lecturer'}
                </h1>
                <p className="text-gray-300 text-lg">
                  Teaching Excellence Dashboard
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Academic Year 2024-2025
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">{courses.length}</span>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Active Courses</p>
                  <p className="text-white font-semibold">This Semester</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {courses.reduce((total, course) => total + (course.student_count || 0), 0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Total Students</p>
                  <p className="text-white font-semibold">Enrolled</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  totalAtRiskStudents > 0 ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  <span className="text-white font-semibold">
                    {totalAtRiskStudents}
                  </span>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">At-Risk Students</p>
                  <p className={`font-semibold ${
                    totalAtRiskStudents > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {totalAtRiskStudents > 0 ? 'Need Support' : 'All On Track'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                      Credits: {course.credits}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedModule && (
              <Card className="mt-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {courses.find(c => c.id.toString() === selectedModule)?.course_name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Student roster and at-risk students monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedCourseTab} onValueChange={setSelectedCourseTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                      <TabsTrigger 
                        value="roster" 
                        className="data-[state=active]:bg-gray-600 data-[state=active]:text-blue-400"
                      >
                        Student Roster ({studentRoster.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="at-risk" 
                        className="data-[state=active]:bg-gray-600 data-[state=active]:text-red-400"
                      >
                        At-Risk Students ({courseAtRiskStudents.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="roster" className="space-y-4">
                      
                      
                      
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
                                  <div className={`bg-gradient-to-r ${
                                    student.predicted_grade >= 50 
                                      ? 'from-green-900/30 to-green-800/20 border-green-600/40' 
                                      : 'from-red-900/30 to-red-800/20 border-red-600/40'
                                  } px-2 py-1.5 rounded-lg border flex items-center space-x-2`}>
                                    <div className="text-sm font-medium text-blue-400">
                                      Predicted Grade:
                                    </div>
                                    <div className="text-center">
                                      <div className={`text-xl font-extrabold ${
                                        student.predicted_grade >= 50 ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        {getGradeFromPercentage(student.predicted_grade)}
                                      </div>
                                      <div className={`text-xs font-medium ${
                                        student.predicted_grade >= 50 ? 'text-green-200' : 'text-red-200'
                                      }`}>
                                        {student.predicted_grade.toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-800/30 border-gray-600/40 px-2 py-1.5 rounded-lg border flex items-center space-x-2">
                                    <div className="text-sm font-medium text-gray-400">
                                      Predicted Grade:
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xl text-gray-500 font-extrabold">--</div>
                                      <div className="text-xs text-gray-400">N/A</div>
                                    </div>
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
                    </TabsContent>
                    
                    <TabsContent value="at-risk" className="space-y-4">
                      {courseAtRiskStudents.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 text-green-400 mx-auto mb-3">✅</div>
                          <p className="text-gray-300 text-lg">All students on track!</p>
                          <p className="text-gray-400 text-sm">No students currently at risk in this course.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {courseAtRiskStudents.map((student, index) => (
                            <div key={`${student.id}-${index}`} className="p-4 border border-red-600/30 rounded-lg bg-gray-700 border-l-4 border-l-red-500">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-white text-sm">{student.student_name}</h4>
                                    <Badge className={getRiskLevelColor(student.risk_level)}>
                                      {student.risk_level} risk
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-gray-300 text-sm mb-3">
                                    {student.alert_message}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className={`border-current ${getPredictionColor(student.predicted_percentage)}`}>
                                        Predicted : {getGradeFromPercentage(student.predicted_percentage)} ({student.predicted_percentage}%)
                                      </Badge>
                                      <div className="text-xs text-gray-400">
                                        {new Date(student.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-400 border-blue-400 hover:bg-blue-600 hover:text-white"
                                      >
                                        Contact
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-400 border-green-400 hover:bg-green-600 hover:text-white"
                                        onClick={() => {
                                          const rosterStudent = studentRoster.find(s => s.full_name === student.student_name);
                                          if (rosterStudent) handleAddMarks(rosterStudent);
                                        }}
                                      >
                                        Add Marks
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                            <h4 className="font-medium text-blue-300 mb-2">💡 Intervention Recommendations:</h4>
                            <ul className="space-y-1 text-blue-200 text-sm">
                              <li>• Schedule one-on-one meetings with these students</li>
                              <li>• Provide additional study materials for this course</li>
                              <li>• Consider extending assignment deadlines</li>
                              <li>• Connect students with tutoring services</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
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
