
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PersonalDataForm from '@/components/PersonalDataForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentDashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Function to convert percentage to grade letter
  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const modules = [
    {
      id: '1',
      name: 'Computer Science Fundamentals',
      code: 'CS101',
      currentGrade: 78,
      predictedFinal: 82,
      status: 'On Track',
      marks: {
        quiz1: 85,
        quiz2: 75,
        assignment1: 80,
        assignment2: 78,
        midterm: 76,
        predicted: 82
      }
    },
    {
      id: '2',
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      currentGrade: 65,
      predictedFinal: 68,
      status: 'At Risk',
      marks: {
        quiz1: 70,
        quiz2: 60,
        assignment1: 65,
        assignment2: 68,
        midterm: 63,
        predicted: 68
      }
    },
    {
      id: '3',
      name: 'Web Development',
      code: 'CS301',
      currentGrade: 92,
      predictedFinal: 94,
      status: 'Excellent',
      marks: {
        quiz1: 95,
        quiz2: 88,
        assignment1: 92,
        assignment2: 94,
        midterm: 91,
        predicted: 94
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-purple-600 text-purple-100';
      case 'On Track': return 'bg-blue-600 text-blue-100';
      case 'At Risk': return 'bg-pink-600 text-pink-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Academic Journey</h2>
          <p className="text-blue-100">Track your progress and stay on top of your studies with predictive insights.</p>
        </div>

        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="modules" className="data-[state=active]:bg-gray-700">My Modules</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-gray-700">Personal Data</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Modules Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow cursor-pointer bg-gray-800 border-gray-700"
                      onClick={() => setSelectedModule(module.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">{module.code}</CardTitle>
                        <CardDescription className="text-sm text-gray-300">{module.name}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Current Grade</span>
                          <span className="font-medium text-white">{module.currentGrade}% ({getGradeLetter(module.currentGrade)})</span>
                        </div>
                        <Progress value={module.currentGrade} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-400">
                        Predicted Final: <span className="font-medium text-purple-400">{getGradeLetter(module.predictedFinal)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed View */}
            {selectedModule && (
              <Card className="mt-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Detailed Marks - {modules.find(m => m.id === selectedModule)?.name}</CardTitle>
                  <CardDescription className="text-gray-300">Complete breakdown of your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const module = modules.find(m => m.id === selectedModule);
                    if (!module) return null;
                    
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{module.marks.quiz1}</div>
                          <div className="text-sm text-gray-300">Quiz 1</div>
                        </div>
                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{module.marks.quiz2}</div>
                          <div className="text-sm text-gray-300">Quiz 2</div>
                        </div>
                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">{module.marks.assignment1}</div>
                          <div className="text-sm text-gray-300">Assignment 1</div>
                        </div>
                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">{module.marks.assignment2}</div>
                          <div className="text-sm text-gray-300">Assignment 2</div>
                        </div>
                        <div className="text-center p-3 bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-pink-400">{module.marks.midterm}</div>
                          <div className="text-sm text-gray-300">Midterm</div>
                        </div>
                        <div className="text-center p-3 bg-purple-700 rounded-lg border-2 border-purple-500">
                          <div className="text-2xl font-bold text-purple-200">{getGradeLetter(module.marks.predicted)}</div>
                          <div className="text-sm text-purple-200 font-medium">Predicted Final</div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <PersonalDataForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
