import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';

interface Student {
  id: number;
  username: string;
  full_name: string;
  email: string;
  motivation_level: number | null;
}

interface StudentCourse {
  course_id: number;
  course_code: string;
  course_name: string;
  enrollment_date: string;
  attendance: number | null;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMotivation, setSelectedMotivation] = useState<string>('');
  const [attendanceInputs, setAttendanceInputs] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students-management');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCourses = async (studentId: number) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}/courses`);
      if (response.ok) {
        const data = await response.json();
        setStudentCourses(data);
        
        // Initialize attendance inputs with current values
        const initialAttendance: {[key: number]: string} = {};
        data.forEach((course: StudentCourse) => {
          initialAttendance[course.course_id] = course.attendance?.toString() || '';
        });
        setAttendanceInputs(initialAttendance);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch student courses",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student courses",
        variant: "destructive"
      });
    }
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    
    // Set current motivation level
    if (student.motivation_level !== null) {
      const motivationMap = { 0: 'high', 1: 'low', 2: 'medium' };
      setSelectedMotivation(motivationMap[student.motivation_level as keyof typeof motivationMap] || '');
    } else {
      setSelectedMotivation('');
    }
    
    await fetchStudentCourses(student.id);
    setIsModalOpen(true);
  };

  const handleMotivationUpdate = async () => {
    if (!selectedStudent || !selectedMotivation) {
      toast({
        title: "Error",
        description: "Please select a motivation level",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/students/motivation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          motivation_level: selectedMotivation
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Motivation level updated successfully"
        });
        fetchStudents(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update motivation level",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update motivation level",
        variant: "destructive"
      });
    }
  };

  const handleAttendanceUpdate = async (courseId: number) => {
    if (!selectedStudent) return;

    const attendanceValue = attendanceInputs[courseId];
    if (!attendanceValue || parseFloat(attendanceValue) < 0 || parseFloat(attendanceValue) > 100) {
      toast({
        title: "Error",
        description: "Please enter a valid attendance percentage (0-100)",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/students/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: courseId,
          attendance: parseFloat(attendanceValue)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attendance updated successfully"
        });
        fetchStudentCourses(selectedStudent.id); // Refresh course data
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update attendance",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive"
      });
    }
  };

  const handleAttendanceInputChange = (courseId: number, value: string) => {
    setAttendanceInputs(prev => ({
      ...prev,
      [courseId]: value
    }));
  };

  const getMotivationBadgeColor = (level: number | null) => {
    if (level === null) return "bg-gray-600 text-gray-300";
    switch (level) {
      case 0: return "bg-green-600 text-white"; // high
      case 1: return "bg-red-600 text-white"; // low
      case 2: return "bg-yellow-600 text-white"; // medium
      default: return "bg-gray-600 text-gray-300";
    }
  };

  const getMotivationText = (level: number | null) => {
    if (level === null) return "Not Set";
    switch (level) {
      case 0: return "High";
      case 1: return "Low";
      case 2: return "Medium";
      default: return "Not Set";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Management
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manage student motivation levels and course-wise attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleStudentClick(student)}
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{student.full_name}</div>
                  <div className="text-sm text-gray-400">{student.email}</div>
                  <div className="text-sm text-gray-400">Username: {student.username}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getMotivationBadgeColor(student.motivation_level)}>
                    Motivation: {getMotivationText(student.motivation_level)}
                  </Badge>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Manage Student: {selectedStudent?.full_name}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Update motivation level and course-wise attendance for {selectedStudent?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Motivation Level Section */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Motivation Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motivation" className="text-gray-200">Select Motivation Level</Label>
                  <Select value={selectedMotivation} onValueChange={setSelectedMotivation}>
                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                      <SelectValue placeholder="Select motivation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleMotivationUpdate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Update Motivation Level
                </Button>
              </CardContent>
            </Card>

            {/* Course-wise Attendance Section */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Course-wise Attendance
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Set attendance percentage for each enrolled course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentCourses.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    Student is not enrolled in any courses
                  </p>
                ) : (
                  <div className="space-y-4">
                    {studentCourses.map((course) => (
                      <div key={course.course_id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {course.course_code} - {course.course_name}
                          </div>
                          <div className="text-sm text-gray-300 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Enrolled: {new Date(course.enrollment_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`attendance-${course.course_id}`} className="text-gray-200 whitespace-nowrap">
                            Attendance (%)
                          </Label>
                          <Input
                            id={`attendance-${course.course_id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="85.5"
                            value={attendanceInputs[course.course_id] || ''}
                            onChange={(e) => handleAttendanceInputChange(course.course_id, e.target.value)}
                            className="bg-gray-500 border-gray-400 text-white w-20"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAttendanceUpdate(course.course_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
