import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Users, UserPlus } from "lucide-react";

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  description: string;
  credits: number;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  lecturer_count: number;
  student_count: number;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseAssignments, setCourseAssignments] = useState<{ lecturers: User[], students: User[] }>({ lecturers: [], students: [] });

  // Form state
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_name: '',
    description: '',
    credits: 3,
    difficulty_level: 'Medium' as 'Easy' | 'Medium' | 'Hard'
  });

  const [assignmentForm, setAssignmentForm] = useState({
    selectedLecturer: '',
    selectedStudent: ''
  });

  // Bulk enrollment state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchCourses();
    fetchLecturers();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    console.log("🔍 Fetching courses...");
    try {
      const response = await fetch('/api/admin/courses');
      console.log("📡 Fetch courses response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📚 Courses data received:", data);
        setCourses(data);
      } else {
        console.error("❌ Failed to fetch courses, status:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
        toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" });
      }
    } catch (error) {
      console.error("❌ Network error fetching courses:", error);
      toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" });
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await fetch('/api/admin/lecturers');
      const data = await response.json();
      setLecturers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch lecturers", variant: "destructive" });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch students", variant: "destructive" });
    }
  };

  const fetchCourseAssignments = async (courseId: number) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/assignments`);
      const data = await response.json();
      setCourseAssignments(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch course assignments", variant: "destructive" });
    }
  };

  // Course CRUD operations
  const handleAddCourse = async () => {
    // Validate required fields
    if (!courseForm.course_code.trim()) {
      toast({ title: "Validation Error", description: "Course code is required", variant: "destructive" });
      return;
    }
    
    if (!courseForm.course_name.trim()) {
      toast({ title: "Validation Error", description: "Course name is required", variant: "destructive" });
      return;
    }
    
    // Assign a random difficulty level
    const difficultyLevels: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
    const randomDifficulty = difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
    
    const courseData = {
      ...courseForm,
      difficulty_level: randomDifficulty
    };
    
    console.log("🔄 Adding course with data:", courseData);
    
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });

      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ Course added successfully:", result);
        toast({ title: "Success", description: `Course added successfully with ${randomDifficulty} difficulty level` });
        await fetchCourses(); // Wait for courses to be fetched
        setIsAddingCourse(false);
        resetCourseForm();
      } else {
        const error = await response.json();
        console.error("❌ Error response:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      toast({ title: "Error", description: "Failed to add course", variant: "destructive" });
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Course updated successfully" });
        fetchCourses();
        setIsEditingCourse(false);
        setSelectedCourse(null);
        resetCourseForm();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: "Success", description: "Course deleted successfully" });
        fetchCourses();
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
    }
  };

  // Assignment operations
  const handleAssignLecturer = async () => {
    if (!selectedCourse || !assignmentForm.selectedLecturer) return;

    try {
      const response = await fetch('/api/admin/assign-lecturer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecturer_id: assignmentForm.selectedLecturer,
          course_id: selectedCourse.id
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Lecturer assigned successfully" });
        fetchCourseAssignments(selectedCourse.id);
        fetchCourses();
        setAssignmentForm(prev => ({ ...prev, selectedLecturer: '' }));
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign lecturer", variant: "destructive" });
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedCourse || !assignmentForm.selectedStudent) return;

    try {
      const response = await fetch('/api/admin/enroll-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: assignmentForm.selectedStudent,
          course_id: selectedCourse.id
        })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Student enrolled successfully" });
        fetchCourseAssignments(selectedCourse.id);
        fetchCourses();
        setAssignmentForm(prev => ({ ...prev, selectedStudent: '' }));
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to enroll student", variant: "destructive" });
    }
  };

  const handleBulkEnrollStudents = async () => {
    if (!selectedCourse || selectedStudents.length === 0) {
      toast({ title: "Error", description: "Please select at least one student", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/admin/bulk-enroll-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: selectedStudents.map(id => parseInt(id)),
          course_id: selectedCourse.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({ 
          title: "Success", 
          description: result.message
        });
        fetchCourseAssignments(selectedCourse.id);
        fetchCourses();
        setSelectedStudents([]);
        setIsBulkMode(false);
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to enroll students", variant: "destructive" });
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      // Filter out students who are already enrolled
      const enrolledStudentIds = courseAssignments.students.map(s => s.id.toString());
      const availableStudentIds = students
        .filter(student => !enrolledStudentIds.includes(student.id.toString()))
        .map(student => student.id.toString());
      setSelectedStudents(availableStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      course_code: '',
      course_name: '',
      description: '',
      credits: 3,
      difficulty_level: 'Medium'
    });
  };

  const editCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      course_code: course.course_code,
      course_name: course.course_name,
      description: course.description,
      credits: course.credits,
      difficulty_level: course.difficulty_level
    });
    setIsEditingCourse(true);
  };

  const goToAssignments = (course: Course) => {
    setSelectedCourse(course);
    fetchCourseAssignments(course.id);
    setActiveTab('assignments');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Course Management</h2>
        <Button onClick={() => setIsAddingCourse(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="courses" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">
            Courses
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400">
            Course Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="bg-gray-800 border-gray-700 flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-white">
                    <span>{course.course_code}</span>
                    <Badge className="bg-blue-600 text-white">
                      {course.credits} Credits
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">{course.course_name}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>{course.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-end">
                      <span className="flex items-center gap-2 text-sm text-gray-300">
                        <Users className="w-4 h-4" />
                        {course.student_count} students
                      </span>
                    </div>
                    <div className="space-y-2">
                      {/* First row - Assignments */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => goToAssignments(course)}
                          className="border-blue-600 text-blue-400 hover:bg-blue-700 w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assignments
                        </Button>
                      </div>
                      {/* Second row - Edit and Delete */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => editCourse(course)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="border-red-600 text-red-400 hover:bg-red-700 flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {selectedCourse ? (
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{selectedCourse.course_name}</CardTitle>
                  <CardDescription className="text-gray-300">{selectedCourse.course_code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Lecturer Assignment */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Assign Lecturer</h4>
                    <div className="flex gap-2">
                      <Select 
                        value={assignmentForm.selectedLecturer} 
                        onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, selectedLecturer: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select lecturer" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {lecturers.map((lecturer) => (
                            <SelectItem key={lecturer.id} value={lecturer.id.toString()}>
                              {lecturer.full_name} ({lecturer.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignLecturer} className="bg-blue-600 hover:bg-blue-700">
                        Assign
                      </Button>
                    </div>
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Assigned Lecturers:</h5>
                      <div className="space-y-1">
                        {courseAssignments.lecturers.map((lecturer) => (
                          <div key={lecturer.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                            <span className="text-white">{lecturer.full_name}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-600 text-red-400 hover:bg-red-700"
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/admin/assign-lecturer', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      lecturer_id: lecturer.id,
                                      course_id: selectedCourse.id
                                    })
                                  });
                                  if (response.ok) {
                                    fetchCourseAssignments(selectedCourse.id);
                                    fetchCourses();
                                    toast({ title: "Success", description: "Lecturer removed successfully" });
                                  }
                                } catch (error) {
                                  toast({ title: "Error", description: "Failed to remove lecturer", variant: "destructive" });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Student Enrollment */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Enroll Student</h4>
                    <div className="flex gap-2">
                      <Select 
                        value={assignmentForm.selectedStudent} 
                        onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, selectedStudent: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.full_name} ({student.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleEnrollStudent} className="bg-green-600 hover:bg-green-700">
                        Enroll
                      </Button>
                    </div>
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Enrolled Students ({courseAssignments.students.length}):</h5>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {courseAssignments.students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                            <span className="text-white">{student.full_name}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-600 text-red-400 hover:bg-red-700"
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/admin/enroll-student', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      student_id: student.id,
                                      course_id: selectedCourse.id
                                    })
                                  });
                                  if (response.ok) {
                                    fetchCourseAssignments(selectedCourse.id);
                                    fetchCourses();
                                    toast({ title: "Success", description: "Student removed successfully" });
                                  }
                                } catch (error) {
                                  toast({ title: "Error", description: "Failed to remove student", variant: "destructive" });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bulk Enrollment */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white mb-3">Bulk Enroll Students</h4>
                      <Button 
                        onClick={() => setIsBulkMode(prev => !prev)} 
                        className={`px-3 py-1 text-sm rounded ${isBulkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {isBulkMode ? 'Cancel Bulk Enroll' : 'Enable Bulk Enroll'}
                      </Button>
                    </div>
                    {isBulkMode && (
                      <div className="p-4 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-300">Select Students</h5>
                          <Button 
                            size="sm" 
                            onClick={() => handleSelectAllStudents(selectedStudents.length !== students.length)}
                            className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700"
                          >
                            {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {students.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-2 rounded bg-gray-600 mb-2">
                              <div className="flex items-center">
                                <Checkbox 
                                  checked={selectedStudents.includes(student.id.toString())}
                                  onCheckedChange={(checked) => handleStudentSelection(student.id.toString(), !!checked)}
                                  className="mr-2"
                                />
                                <span className="text-white">{student.full_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <Button 
                            onClick={handleBulkEnrollStudents} 
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Enroll Selected Students
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Select a course from the Courses tab to manage assignments</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Course Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create a new course in the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course_code" className="text-white">Course Code</Label>
              <Input
                id="course_code"
                value={courseForm.course_code}
                onChange={(e) => setCourseForm(prev => ({ ...prev, course_code: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g., CSCI22062"
              />
            </div>
            <div>
              <Label htmlFor="course_name" className="text-white">Course Name</Label>
              <Input
                id="course_name"
                value={courseForm.course_name}
                onChange={(e) => setCourseForm(prev => ({ ...prev, course_name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g., Introduction to Cyber Security"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Course description..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="credits" className="text-white">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700">
                Add Course
              </Button>
              <Button variant="outline" onClick={() => setIsAddingCourse(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditingCourse} onOpenChange={setIsEditingCourse}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update course information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_course_code" className="text-white">Course Code</Label>
              <Input
                id="edit_course_code"
                value={courseForm.course_code}
                onChange={(e) => setCourseForm(prev => ({ ...prev, course_code: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_course_name" className="text-white">Course Name</Label>
              <Input
                id="edit_course_name"
                value={courseForm.course_name}
                onChange={(e) => setCourseForm(prev => ({ ...prev, course_name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit_description" className="text-white">Description</Label>
              <Textarea
                id="edit_description"
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="edit_credits" className="text-white">Credits</Label>
                <Input
                  id="edit_credits"
                  type="number"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateCourse} className="bg-blue-600 hover:bg-blue-700">
                Update Course
              </Button>
              <Button variant="outline" onClick={() => setIsEditingCourse(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
