import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PersonalDataForm from '@/components/PersonalDataForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Brain, TrendingUp, User, Moon, Sun, LogOut, Upload, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Student profile data
  const studentProfile = {
    name: "Akila Fernando",
    email: "akilaf@university.edu",
    studentId: "CS2021001",
    academicYear: "3rd Year",
    profileImage: "/api/placeholder/100/100"
  };

  // Academic data form state
  const [academicData, setAcademicData] = useState({
    hoursStudied: '',
    sleepHours: '',
    physicalActivity: '',
    extracurricular: '',
    motivationLevel: '',
    teacherQuality: '',
    peerInfluence: '',
    gender: ''
  });

  // Performance history data for charts
  const performanceHistory = [
    { month: 'Jan', quiz: 75, assignment: 80, midterm: 78 },
    { month: 'Feb', quiz: 80, assignment: 85, midterm: 82 },
    { month: 'Mar', quiz: 85, assignment: 88, midterm: 87 },
    { month: 'Apr', quiz: 82, assignment: 90, midterm: 85 },
    { month: 'May', quiz: 88, assignment: 92, midterm: 89 }
  ];

  // Notifications
  const notifications = [
    { id: 1, message: "Assignment 3 deadline approaching for CS301", type: "warning", time: "2 hours ago" },
    { id: 2, message: "Your predicted grade for CS201 has improved to C+", type: "success", time: "1 day ago" },
    { id: 3, message: "Midterm results are now available", type: "info", time: "3 days ago" }
  ];

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

  const handlePredictGrade = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to ML backend
      const response = await fetch('/api/predict-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(academicData)
      });
      
      // Mock prediction result
      setTimeout(() => {
        setPrediction({
          grade: 'B+',
          confidence: 85,
          suggestions: [
            'Increase study hours to 8-10 per week for better performance',
            'Focus more on Data Structures & Algorithms course',
            'Consider joining study groups for peer learning'
          ]
        });
        setIsLoading(false);
        toast({
          title: "Prediction Complete",
          description: "Your academic performance has been analyzed successfully."
        });
      }, 2000);
    } catch (error) {
      console.error('Prediction failed:', error);
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `Switched to ${isDarkMode ? 'Light' : 'Dark'} Mode`,
      description: "Theme preferences updated."
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    // Implement logout logic
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Header with Profile and Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <img 
                src={studentProfile.profileImage} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-4 border-white/30"
              />
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome back, {studentProfile.name}!</h2>
                <p className="text-blue-100 mb-1">{studentProfile.email} • {studentProfile.studentId}</p>
                <p className="text-blue-200 text-sm">{studentProfile.academicYear} • Computer Science</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme}
                className="text-white hover:bg-white/20"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        </div>

        {/* Notifications */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span className="text-gray-200 text-sm">{notification.message}</span>
                  <span className="text-gray-400 text-xs">{notification.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="modules" className="data-[state=active]:bg-gray-700">My Modules</TabsTrigger>
            <TabsTrigger value="prediction" className="data-[state=active]:bg-gray-700">AI Prediction</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">Progress Analytics</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700">Profile & Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* AI Alerts */}
            {modules.some(m => m.status === 'At Risk') && (
              <Alert className="border-red-600 bg-red-900/20">
                <Brain className="h-4 w-4" />
                <AlertTitle className="text-red-300">AI Performance Alert</AlertTitle>
                <AlertDescription className="text-red-200">
                  Our AI analysis suggests you may need to focus more on Data Structures & Algorithms. 
                  Consider increasing study hours and seeking additional help.
                </AlertDescription>
              </Alert>
            )}

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
                        AI Predicted Final: <span className="font-medium text-purple-400">{getGradeLetter(module.predictedFinal)} ({module.predictedFinal}%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Module View */}
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
                          <div className="text-sm text-purple-200 font-medium">AI Predicted Final</div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Academic Data Input Form */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Academic Data Input
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Enter your academic and behavioral data for AI prediction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hoursStudied" className="text-gray-200">Hours Studied (per week)</Label>
                      <Input
                        id="hoursStudied"
                        type="number"
                        min="0"
                        max="168"
                        placeholder="25"
                        value={academicData.hoursStudied}
                        onChange={(e) => setAcademicData(prev => ({ ...prev, hoursStudied: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sleepHours" className="text-gray-200">Sleep Hours (per day)</Label>
                      <Input
                        id="sleepHours"
                        type="number"
                        min="0"
                        max="24"
                        placeholder="8"
                        value={academicData.sleepHours}
                        onChange={(e) => setAcademicData(prev => ({ ...prev, sleepHours: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physicalActivity" className="text-gray-200">Physical Activity (hours/week)</Label>
                      <Input
                        id="physicalActivity"
                        type="number"
                        min="0"
                        placeholder="5"
                        value={academicData.physicalActivity}
                        onChange={(e) => setAcademicData(prev => ({ ...prev, physicalActivity: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-200">Extracurricular Activities</Label>
                      <Select value={academicData.extracurricular} onValueChange={(value) => setAcademicData(prev => ({ ...prev, extracurricular: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-200">Motivation Level</Label>
                      <Select value={academicData.motivationLevel} onValueChange={(value) => setAcademicData(prev => ({ ...prev, motivationLevel: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-200">Teacher Quality</Label>
                      <Select value={academicData.teacherQuality} onValueChange={(value) => setAcademicData(prev => ({ ...prev, teacherQuality: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-200">Peer Influence</Label>
                      <Select value={academicData.peerInfluence} onValueChange={(value) => setAcademicData(prev => ({ ...prev, peerInfluence: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select influence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="positive">Positive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200">Gender</Label>
                    <RadioGroup value={academicData.gender} onValueChange={(value) => setAcademicData(prev => ({ ...prev, gender: value }))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="text-gray-300">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="text-gray-300">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="text-gray-300">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={handlePredictGrade} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Analyzing...' : 'Predict My Performance'}
                  </Button>
                </CardContent>
              </Card>

              {/* Prediction Results */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">AI Prediction Results</CardTitle>
                  <CardDescription className="text-gray-300">
                    Your predicted academic performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {prediction ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-purple-400 mb-2">{prediction.grade}</div>
                        <div className="text-lg text-gray-300 mb-4">Predicted Final Grade</div>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-gray-400">Confidence:</span>
                          <div className="flex-1 max-w-xs">
                            <Progress value={prediction.confidence} className="h-2" />
                          </div>
                          <span className="text-white font-medium">{prediction.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-200">AI Suggestions:</h4>
                        {prediction.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-300 text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter your academic data and click "Predict" to see AI analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Performance Trends */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Your academic performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#ffffff'
                        }} 
                      />
                      <Line type="monotone" dataKey="quiz" stroke="#60A5FA" strokeWidth={2} />
                      <Line type="monotone" dataKey="assignment" stroke="#A78BFA" strokeWidth={2} />
                      <Line type="monotone" dataKey="midterm" stroke="#F472B6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Current Semester Overview</CardTitle>
                  <CardDescription className="text-gray-300">
                    Grade distribution across subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modules.map(m => ({ name: m.code, grade: m.currentGrade }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#ffffff'
                        }} 
                      />
                      <Bar dataKey="grade" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Report Downloads */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Reports</CardTitle>
                <CardDescription className="text-gray-300">
                  Download or view your academic reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Transcript
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Download className="w-4 h-4 mr-2" />
                    Performance Report
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={studentProfile.profileImage} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full border-4 border-gray-600"
                    />
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-white">{studentProfile.name}</h3>
                      <p className="text-gray-300">{studentProfile.email}</p>
                      <p className="text-gray-400">{studentProfile.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Academic Year:</span>
                      <span className="text-white">{studentProfile.academicYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Department:</span>
                      <span className="text-white">Computer Science</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Overall GPA:</span>
                      <span className="text-white">3.42</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Personal Data Form */}
              <PersonalDataForm />
            </div>

            {/* All Notifications */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          notification.type === 'warning' ? 'bg-yellow-400' :
                          notification.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                        }`}></div>
                        <span className="text-gray-200">{notification.message}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{notification.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;