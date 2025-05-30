
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MarksEntryModal from '@/components/MarksEntryModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LecturerDashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);

  const courses = [
    {
      id: '1',
      name: 'Computer Science Fundamentals',
      code: 'CS101',
      students: 45,
      atRiskCount: 3
    },
    {
      id: '2',
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      students: 38,
      atRiskCount: 7
    },
    {
      id: '3',
      name: 'Web Development',
      code: 'CS301',
      students: 52,
      atRiskCount: 2
    }
  ];

  const atRiskStudents = [
    { id: '1', name: 'Alice Johnson', course: 'CS201', predictedGrade: 45, riskFactors: ['Low attendance', 'Missing assignments'] },
    { id: '2', name: 'Bob Smith', course: 'CS201', predictedGrade: 52, riskFactors: ['Poor quiz performance'] },
    { id: '3', name: 'Carol Williams', course: 'CS101', predictedGrade: 48, riskFactors: ['Low study hours', 'Poor sleep'] }
  ];

  const studentRoster = [
    { id: '1', name: 'John Doe', email: 'john.doe@university.edu', currentGrade: 78, quiz1: 85, quiz2: 75, assignment1: 80, assignment2: 78, midterm: 76 },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@university.edu', currentGrade: 85, quiz1: 88, quiz2: 82, assignment1: 87, assignment2: 85, midterm: 84 },
    { id: '3', name: 'Alice Johnson', email: 'alice.johnson@university.edu', currentGrade: 45, quiz1: 50, quiz2: 40, assignment1: 45, assignment2: 48, midterm: 42 },
    { id: '4', name: 'Bob Williams', email: 'bob.williams@university.edu', currentGrade: 92, quiz1: 95, quiz2: 88, assignment1: 92, assignment2: 94, midterm: 91 }
  ];

  const handleAddMarks = (student) => {
    setSelectedStudent(student);
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = (studentId, marks) => {
    console.log('Saving marks for student:', studentId, marks);
    // Here you would typically update the backend
  };

  return (
    <DashboardLayout title="Lecturer Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Teaching Excellence Dashboard</h2>
          <p className="text-purple-100">Monitor student progress and identify those who need additional support.</p>
        </div>

        {/* At-Risk Students Alert */}
        <Alert className="border-pink-600 bg-pink-900/20 border">
          <AlertTitle className="text-pink-300">⚠️ Students At Risk</AlertTitle>
          <AlertDescription className="text-pink-200">
            {atRiskStudents.length} students are predicted to be at risk of failing. Review their details below.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gray-700">My Courses</TabsTrigger>
            <TabsTrigger value="at-risk" className="data-[state=active]:bg-gray-700">At-Risk Students</TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-gray-700">Grade Management</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer bg-gray-800 border-gray-700"
                      onClick={() => setSelectedModule(course.id)}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-white">
                      <span>{course.code}</span>
                      {course.atRiskCount > 0 && (
                        <Badge className="bg-pink-600 text-pink-100">{course.atRiskCount} at risk</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-300">{course.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">{course.students}</div>
                    <div className="text-sm text-gray-300">Enrolled Students</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedModule && (
              <Card className="mt-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Student Roster - {courses.find(c => c.id === selectedModule)?.name}</CardTitle>
                  <CardDescription className="text-gray-300">Manage students and their grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {studentRoster.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{student.name}</div>
                          <div className="text-sm text-gray-400">{student.email}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-blue-400">{student.currentGrade}%</span>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddMarks(student)}
                            className="bg-purple-600 hover:bg-purple-700"
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
              <Card key={student.id} className="border-pink-600 bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-white">
                    <span>{student.name}</span>
                    <Badge className="bg-pink-600 text-pink-100">Predicted: {student.predictedGrade}%</Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">Course: {student.course}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-200">Risk Factors:</div>
                    <div className="flex flex-wrap gap-2">
                      {student.riskFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-pink-400 border-pink-600">
                          {factor}
                        </Badge>
                      ))}
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
