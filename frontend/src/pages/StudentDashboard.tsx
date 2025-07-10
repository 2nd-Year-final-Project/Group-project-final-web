import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Bell,
  Brain,
  TrendingUp,
  User,
  Moon,
  Sun,
  LogOut,
  Upload,
  Download,
  BarChart3,
  BookOpen,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Settings,
  Home,
  Target,
  Award,
  Clock,
  Users,
  FileText,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState<string>("Loading...");
  const username = localStorage.getItem("username");

  // Student profile data
  const studentProfile = {
    name: fullName,
    email: "akilaf@university.edu",
    studentId: "CS2021001",
    academicYear: "3rd Year",
    profileImage: "/api/placeholder/100/100",
    overallGPA: 3.42,
    attendance: 92,
  };

  // Academic data form state - update to include per-subject data
  const [academicData, setAcademicData] = useState({
    sleepHours: "",
    physicalActivity: "",
    extracurricular: "",
    peerInfluence: "",
    gender: "",
  });

  // Subject-specific data state
  const [subjectData, setSubjectData] = useState({
    "1": { hoursStudied: "", teacherQuality: "" },
    "2": { hoursStudied: "", teacherQuality: "" },
    "3": { hoursStudied: "", teacherQuality: "" },
  });

  // Function to get prediction interpretation
  const getPredictionInterpretation = (grade: string, percentage: number) => {
    if (percentage >= 90) return "Excellent performance! You're on track for outstanding results.";
    if (percentage >= 80) return "Very good performance. Keep up the great work!";
    if (percentage >= 70) return "Good performance. Consider focusing on weak areas for improvement.";
    if (percentage >= 60) return "Satisfactory performance. Additional effort needed to improve.";
    if (percentage >= 50) return "Below average performance. Significant improvement required.";
    return "Poor performance. Immediate action needed to avoid failure.";
  };

  // Update subject data handler
  const handleSubjectDataChange = (subjectId: string, field: string, value: string) => {
    setSubjectData(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  // Performance history data for charts
  const performanceHistory = [
    { month: "Jan", quiz: 75, assignment: 80, midterm: 78 },
    { month: "Feb", quiz: 80, assignment: 85, midterm: 82 },
    { month: "Mar", quiz: 85, assignment: 88, midterm: 87 },
    { month: "Apr", quiz: 82, assignment: 90, midterm: 85 },
    { month: "May", quiz: 88, assignment: 92, midterm: 89 },
  ];

  // Notifications
  const notifications = [
    {
      id: 1,
      message: "Assignment 3 deadline approaching for CS301",
      type: "warning",
      time: "2 hours ago",
    },
    {
      id: 2,
      message: "Your predicted grade for CS201 has improved to C+",
      type: "success",
      time: "1 day ago",
    },
    {
      id: 3,
      message: "Midterm results are now available",
      type: "info",
      time: "3 days ago",
    },
    {
      id: 4,
      message: "Study group session scheduled for tomorrow",
      type: "info",
      time: "1 day ago",
    },
  ];

  const modules = [
    {
      id: "1",
      name: "Computer Science Fundamentals",
      code: "CS101",
      currentGrade: 78,
      predictedFinal: 82,
      predictedGrade: "A-",
      status: "On Track",
      attendance: 95,
      lectureAttendance: {
        attended: 19,
        total: 20,
        percentage: 95
      },
      marks: {
        quiz1: 85,
        quiz2: 75,
        assignment1: 80,
        assignment2: 78,
        midterm: 76,
        predicted: 82,
      },
    },
    {
      id: "2",
      name: "Data Structures & Algorithms",
      code: "CS201",
      currentGrade: 65,
      predictedFinal: 68,
      predictedGrade: "B-",
      status: "At Risk",
      attendance: 87,
      lectureAttendance: {
        attended: 17,
        total: 20,
        percentage: 85
      },
      marks: {
        quiz1: 70,
        quiz2: 60,
        assignment1: 65,
        assignment2: 68,
        midterm: 63,
        predicted: 68,
      },
    },
    {
      id: "3",
      name: "Web Development",
      code: "CS301",
      currentGrade: 92,
      predictedFinal: 94,
      predictedGrade: "A+",
      status: "Excellent",
      attendance: 98,
      lectureAttendance: {
        attended: 20,
        total: 20,
        percentage: 100
      },
      marks: {
        quiz1: 95,
        quiz2: 88,
        assignment1: 92,
        assignment2: 94,
        midterm: 91,
        predicted: 94,
      },
    },
  ];

  const sidebarItems = [
    { id: "overview", label: "Dashboard Overview", icon: Home },
    { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
    { id: "subjects", label: "Subject-wise Insights", icon: BookOpen },
    { id: "progress", label: "Progress Tracker", icon: Calendar },
    { id: "alerts", label: "Alerts & Recommendations", icon: AlertTriangle },
    { id: "resources", label: "Resources & Support", icon: HelpCircle },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ];

  // Function to convert percentage to grade letter
  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "B-";
    if (percentage >= 60) return "C+";
    if (percentage >= 55) return "C";
    if (percentage >= 50) return "C-";
    if (percentage >= 45) return "D+";
    if (percentage >= 40) return "D";
    return "F";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-600 text-green-100";
      case "On Track":
        return "bg-blue-600 text-blue-100";
      case "At Risk":
        return "bg-red-600 text-red-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  const handlePredictGrade = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setPrediction({
          grade: "B+",
          confidence: 85,
          suggestions: [
            "Increase study hours to 8-10 per week for better performance",
            "Focus more on Data Structures & Algorithms course",
            "Consider joining study groups for peer learning",
          ],
        });
        setIsLoading(false);
        toast({
          title: "Prediction Complete",
          description:
            "Your academic performance has been analyzed successfully.",
        });
      }, 2000);
    } catch (error) {
      console.error("Prediction failed:", error);
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `Switched to ${isDarkMode ? "Light" : "Dark"} Mode`,
      description: "Theme preferences updated.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const fetchName = async () => {
    try {
      if (!username) {
        setFullName("Student");
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/student/name/${username}`);
      setFullName(res.data.fullName || "Student");
    } catch (err) {
      console.error("Failed to fetch name", err);
      setFullName("Student");
    }
  };

  useEffect(() => {
    fetchName();
  }, [username]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {fullName}!
        </h2>
        <p className="text-blue-100 mb-4">
          "
          {Math.random() > 0.5
            ? "Success is the sum of small efforts repeated day in and day out."
            : "The expert in anything was once a beginner."}
          "
        </p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {studentProfile.overallGPA}
            </div>
            <div className="text-sm text-blue-200">Overall GPA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {studentProfile.attendance}%
            </div>
            <div className="text-sm text-blue-200">Attendance</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Predicted GPA</p>
                <p className="text-2xl font-bold text-white">3.6</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Goals Achieved</p>
                <p className="text-2xl font-bold text-white">7/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Performance</p>
                <p className="text-2xl font-bold text-white">Good</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Study Hours</p>
                <p className="text-2xl font-bold text-white">35h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Progress Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Subject Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getStatusColor(module.status)}
                      variant="secondary"
                    >
                      {module.code}
                    </Badge>
                    <span className="text-gray-300 text-sm">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={module.currentGrade}
                      className="w-20 h-2"
                    />
                    <span className="text-white text-sm font-medium">
                      {module.currentGrade}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
                <Brain className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-medium">
                    Focus on Data Structures
                  </p>
                  <p className="text-blue-200 text-sm">
                    Your performance in CS201 needs attention. Consider
                    additional practice sessions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium">Great Progress!</p>
                  <p className="text-green-200 text-sm">
                    Keep up the excellent work in Web Development.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
        <Select defaultValue="semester">
          <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="quiz"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  name="Quiz"
                />
                <Line
                  type="monotone"
                  dataKey="assignment"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  name="Assignment"
                />
                <Line
                  type="monotone"
                  dataKey="midterm"
                  stroke="#F472B6"
                  strokeWidth={2}
                  name="Midterm"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={modules.map((m) => ({
                  name: m.code,
                  grade: m.currentGrade,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="grade" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">AI Prediction Factors</CardTitle>
          <CardDescription className="text-gray-300">
            Factors that most influence your academic performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { factor: "Hours Studied", importance: 85, color: "bg-blue-500" },
              {
                factor: "Assignment Performance",
                importance: 72,
                color: "bg-purple-500",
              },
              {
                factor: "Class Attendance",
                importance: 68,
                color: "bg-green-500",
              },
              {
                factor: "Motivation Level",
                importance: 55,
                color: "bg-yellow-500",
              },
              { factor: "Sleep Hours", importance: 42, color: "bg-pink-500" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-300">{item.factor}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.importance}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {item.importance}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Subject-wise Insights</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card
            key={module.id}
            className="bg-gray-800 border-gray-700 hover:shadow-lg transition-all cursor-pointer"
            onClick={() =>
              setSelectedModule(selectedModule === module.id ? null : module.id)
            }
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-white">
                    {module.code}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-300">
                    {module.name}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(module.status)}>
                  {module.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Current Grade</span>
                    <span className="font-medium text-white">
                      {module.currentGrade}% (
                      {getGradeLetter(module.currentGrade)})
                    </span>
                  </div>
                  <Progress value={module.currentGrade} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Predicted Final:</span>
                  <span className="font-medium text-purple-400">
                    {module.predictedGrade} ({module.predictedFinal}%)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Lecture Attendance:</span>
                  <span className="font-medium text-green-400">
                    {module.lectureAttendance.attended}/{module.lectureAttendance.total} ({module.lectureAttendance.percentage}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Module View */}
      {selectedModule && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Detailed Analysis - {modules.find((m) => m.id === selectedModule)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const module = modules.find((m) => m.id === selectedModule);
              if (!module) return null;

              return (
                <div className="space-y-6">
                  {/* Input Section */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Study Parameters</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`hoursStudied-${module.id}`} className="text-gray-200">
                            Hours Studied (per week)
                          </Label>
                          <Input
                            id={`hoursStudied-${module.id}`}
                            type="number"
                            min="0"
                            max="168"
                            placeholder="10"
                            value={subjectData[module.id]?.hoursStudied || ""}
                            onChange={(e) => handleSubjectDataChange(module.id, "hoursStudied", e.target.value)}
                            className="bg-gray-600 border-gray-500 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-200">Teacher Quality</Label>
                          <Select
                            value={subjectData[module.id]?.teacherQuality || ""}
                            onValueChange={(value) => handleSubjectDataChange(module.id, "teacherQuality", value)}
                          >
                            <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={() => {
                            toast({
                              title: "Parameters Updated",
                              description: `Study parameters for ${module.code} have been updated.`,
                            });
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Update Parameters
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Attendance Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Lectures Attended:</span>
                            <span className="text-white font-medium">
                              {module.lectureAttendance.attended}/{module.lectureAttendance.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Attendance Rate:</span>
                            <span className={`font-medium ${module.lectureAttendance.percentage >= 90 ? 'text-green-400' : 
                              module.lectureAttendance.percentage >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {module.lectureAttendance.percentage}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <Progress value={module.lectureAttendance.percentage} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                          <p className="text-sm text-gray-300">
                            {module.lectureAttendance.percentage >= 90 
                              ? "Excellent attendance! Keep it up."
                              : module.lectureAttendance.percentage >= 75 
                              ? "Good attendance. Try to maintain consistency."
                              : "Poor attendance. This may affect your performance."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Marks Overview */}
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Assessment Marks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">
                            {module.marks.quiz1}
                          </div>
                          <div className="text-sm text-gray-300">Quiz 1</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">
                            {module.marks.quiz2}
                          </div>
                          <div className="text-sm text-gray-300">Quiz 2</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">
                            {module.marks.assignment1}
                          </div>
                          <div className="text-sm text-gray-300">Assignment 1</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">
                            {module.marks.assignment2}
                          </div>
                          <div className="text-sm text-gray-300">Assignment 2</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">
                            {module.marks.midterm}
                          </div>
                          <div className="text-sm text-gray-300">Midterm</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prediction Section */}
                  <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">AI Prediction Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold text-purple-400">
                            {module.predictedFinal}%
                          </div>
                          <div className="text-2xl font-semibold text-white">
                            {module.predictedGrade}
                          </div>
                          <div className="text-sm text-gray-300">Predicted Final Grade</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="p-3 bg-purple-900/20 rounded-lg">
                            <h4 className="font-medium text-purple-300 mb-2">Interpretation:</h4>
                            <p className="text-purple-200 text-sm">
                              {getPredictionInterpretation(module.predictedGrade, module.predictedFinal)}
                            </p>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Confidence Level:</span>
                            <span className="text-white font-medium">
                              {module.predictedFinal >= 80 ? "High" : 
                               module.predictedFinal >= 60 ? "Medium" : "Low"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                    <h4 className="font-medium text-blue-300 mb-2">AI Recommendations:</h4>
                    <ul className="space-y-1 text-blue-200 text-sm">
                      {module.status === "At Risk"
                        ? [
                            "Focus on understanding core concepts through additional practice",
                            "Attend office hours for personalized help",
                            "Form study groups with classmates",
                            "Review past assignments and identify weak areas",
                            "Increase weekly study hours to improve performance"
                          ].map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))
                        : module.status === "Excellent"
                        ? [
                            "Continue your excellent work!",
                            "Consider helping classmates to reinforce your knowledge",
                            "Explore advanced topics in this subject",
                            "Maintain consistent study habits",
                            "Consider taking advanced courses in this area"
                          ].map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))
                        : [
                            "Keep up the good work and stay consistent",
                            "Review challenging topics before exams",
                            "Participate actively in class discussions",
                            "Complete all assignments on time",
                            "Consider increasing study hours slightly"
                          ].map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Progress Tracker</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Weekly Study Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: "CS101", target: 10, completed: 8, unit: "hours" },
                { subject: "CS201", target: 12, completed: 6, unit: "hours" },
                { subject: "CS301", target: 8, completed: 8, unit: "hours" },
              ].map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{goal.subject}</span>
                    <span className="text-white">
                      {goal.completed}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress
                    value={(goal.completed / goal.target) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Achievement Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: "2024-05-01",
                  event: "Achieved A+ in Web Development Quiz",
                  type: "success",
                },
                {
                  date: "2024-04-28",
                  event: "Completed Data Structures Assignment",
                  type: "info",
                },
                {
                  date: "2024-04-25",
                  event: "Improved CS201 grade by 10%",
                  type: "success",
                },
                {
                  date: "2024-04-20",
                  event: "Started additional study sessions",
                  type: "info",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      item.type === "success" ? "bg-green-400" : "bg-blue-400"
                    }`}
                  />
                  <div>
                    <p className="text-white text-sm">{item.event}</p>
                    <p className="text-gray-400 text-xs">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Compare with Past Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="quiz"
                stroke="#60A5FA"
                strokeWidth={3}
                name="This Year"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">
        Alerts & Recommendations
      </h2>

      {/* Critical Alerts */}
      <div className="space-y-4">
        {modules
          .filter((m) => m.status === "At Risk")
          .map((module) => (
            <Alert key={module.id} className="border-red-600 bg-red-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-red-300">
                Attention Required: {module.code}
              </AlertTitle>
              <AlertDescription className="text-red-200">
                Your performance in {module.name} needs improvement. Current
                grade: {module.currentGrade}%
              </AlertDescription>
            </Alert>
          ))}
      </div>

      {/* Study Plan Generator */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">AI-Generated Study Plan</CardTitle>
          <CardDescription className="text-gray-300">
            Personalized recommendations based on your performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                subject: "CS201 - Data Structures",
                hours: "3 hours/week",
                focus: "Practice coding problems, review tree algorithms",
              },
              {
                subject: "CS101 - Fundamentals",
                hours: "2 hours/week",
                focus: "Maintain current level, review before exams",
              },
              {
                subject: "CS301 - Web Development",
                hours: "1.5 hours/week",
                focus: "Continue excellent work, explore advanced topics",
              },
            ].map((plan, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{plan.subject}</h4>
                  <Badge
                    variant="outline"
                    className="text-blue-400 border-blue-400"
                  >
                    {plan.hours}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">{plan.focus}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Study Habit Alert</p>
                <p className="text-yellow-200 text-sm">
                  Your study hours have decreased by 20% this week. Consider
                  maintaining consistency.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-600/30">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-green-300 font-medium">
                  Improvement Detected
                </p>
                <p className="text-green-200 text-sm">
                  Your assignment scores have improved by 15% over the last
                  month!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Resources & Support</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recommended Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Data Structures Visualization",
                  type: "Interactive Tool",
                  url: "#",
                },
                {
                  title: "Algorithm Practice Problems",
                  type: "Practice Set",
                  url: "#",
                },
                {
                  title: "Web Development Bootcamp",
                  type: "Video Course",
                  url: "#",
                },
                {
                  title: "Computer Science Fundamentals",
                  type: "Study Guide",
                  url: "#",
                },
              ].map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-white font-medium">{resource.title}</p>
                    <p className="text-gray-400 text-sm">{resource.type}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Get Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Join Study Group
              </Button>
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                <User className="w-4 h-4 mr-2" />
                Contact Tutor
              </Button>
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                <HelpCircle className="w-4 h-4 mr-2" />
                Academic Support
              </Button>
              <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                <Brain className="w-4 h-4 mr-2" />
                AI Study Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Transcript
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Performance Report
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Syllabus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Profile Settings</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={studentProfile.profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-gray-600"
              />
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-white">
                  {fullName}
                </h3>
                <p className="text-gray-300">{studentProfile.email}</p>
                <p className="text-gray-400">{studentProfile.studentId}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Academic Year:</span>
                <span className="text-white">
                  {studentProfile.academicYear}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Department:</span>
                <span className="text-white">Computer Science</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Overall GPA:</span>
                <span className="text-white">{studentProfile.overallGPA}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">AI Prediction Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              

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
                <Label htmlFor="physicalActivity" className="text-gray-200">Physical Activity (hours per week)</Label>
                <Input
                  id="physicalActivity"
                  type="number"
                  min="0"
                  max="168"
                  placeholder="5"
                  value={academicData.physicalActivity}
                  onChange={(e) => setAcademicData(prev => ({ ...prev, physicalActivity: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Peer Influence</Label>
                <Select value={academicData.peerInfluence} onValueChange={(value) => setAcademicData(prev => ({ ...prev, peerInfluence: value }))}>
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
                <Label className="text-gray-200">Extracurricular Participation</Label>
                <Select value={academicData.extracurricular} onValueChange={(value) => setAcademicData(prev => ({ ...prev, extracurricular: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
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
                </RadioGroup>
              </div>
            </div>

            <Button 
              onClick={handlePredictGrade} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Update AI Prediction'}
            </Button>

            
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      notification.type === "warning"
                        ? "bg-yellow-400"
                        : notification.type === "success"
                        ? "bg-green-400"
                        : "bg-blue-400"
                    }`}
                  ></div>
                  <span className="text-gray-200">{notification.message}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {notification.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "analytics":
        return renderAnalytics();
      case "subjects":
        return renderSubjects();
      case "progress":
        return renderProgress();
      case "alerts":
        return renderAlerts();
      case "resources":
        return renderResources();
      case "profile":
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">EduTrack</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={studentProfile.profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {studentProfile.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {studentProfile.studentId}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex-1 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex-1 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {sidebarItems.find((item) => item.id === activeSection)
                  ?.label || "Dashboard"}
              </h1>
              <p className="text-gray-400 text-sm">
                Welcome back, {fullName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:bg-gray-700"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => n.type === "warning").length >
                  0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default StudentDashboard;