import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import AlertSystem from '@/components/AlertSystem';
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
  Brain,
  TrendingUp,
  Moon,
  Sun,
  LogOut,
  BarChart3,
  BookOpen,
  AlertTriangle,
  Settings,
  Home,
  Target,
  Award,
  Clock,
  CheckCircle,
  FileText,
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
} from "recharts";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState<string>("Loading...");
  const [modules, setModules] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const user = useAuthStore((state) => state.user);
  const username = localStorage.getItem("username");

  // Fetch student's enrolled courses
  useEffect(() => {
    if (user?.id) {
      fetchStudentCourses();
      fetchExistingCommonData();
    }
  }, [user]);

  // Function to fetch AI prediction for a specific course
  const fetchPrediction = async (courseId: number): Promise<number | null> => {
    if (!user?.id) return null;
    
    try {
      const response = await fetch(`/api/prediction/${user.id}/${courseId}`);
      
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.requiresProfileUpdate) {
          setProfileIncomplete(true);
          return null;
        }
      }
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.predicted_grade ? parseFloat(data.predicted_grade) : null;
    } catch (error) {
      console.error(`Failed to fetch prediction for course ${courseId}:`, error);
      return null;
    }
  };

  const fetchStudentCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch(`/api/student/courses/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch predictions for all courses
        const coursesWithPredictions = await Promise.all(
          data.map(async (course) => {
            const prediction = await fetchPrediction(course.id);
            
            return {
              id: course.id.toString(),
              name: course.course_name,
              code: course.course_code,
              currentGrade: course.current_grade || 0,
              predictedFinal: prediction !== null ? prediction : (course.current_grade || 0),
              predictedGrade: prediction !== null ? getGradeFromPercentage(prediction) : 
                             (course.current_grade ? getGradeFromPercentage(course.current_grade) : "Not Available"),
              status: (prediction !== null ? prediction : (course.current_grade || 0)) >= 60 ? "On Track" : 
                     (prediction !== null || course.current_grade) ? "At Risk" : "Insufficient Data",
              attendance: course.attendance || null, // Use actual attendance from admin input
              marks: {
                quiz1: course.quiz1 !== null ? course.quiz1 : null,
                quiz2: course.quiz2 !== null ? course.quiz2 : null,
                assignment1: course.assignment1 !== null ? course.assignment1 : null,
                assignment2: course.assignment2 !== null ? course.assignment2 : null,
                midterm: course.midterm !== null ? course.midterm : null,
                predicted: prediction !== null ? prediction : (course.current_grade || 0),
              },
              difficulty: course.difficulty_level || "Medium",
              lecturer: course.lecturer_name || "TBA",
              credits: course.credits || 3,
              enrollmentDate: course.enrollment_date,
              description: course.description || ""
            };
          })
        );
        setModules(coursesWithPredictions);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch enrolled courses",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch enrolled courses",
        variant: "destructive"
      });
    } finally {
      setLoadingCourses(false);
    }
  };

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

  // Student profile data
  const studentProfile = {
    name: fullName,
    email: "akilaf@university.edu",
    studentId: "CS2021001",
    academicYear: "3rd Year",
    profileImage: "/api/placeholder/100/100",
  };

  // Calculate overall attendance from all courses
  const calculateOverallAttendance = () => {
    if (!modules || modules.length === 0) return null;
    
    const coursesWithAttendance = modules.filter(module => module.attendance !== null);
    if (coursesWithAttendance.length === 0) return null;
    
    const totalAttendance = coursesWithAttendance.reduce((sum, module) => sum + module.attendance, 0);
    return Math.round(totalAttendance / coursesWithAttendance.length);
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
    if (percentage >= 85) return "Excellent performance! You're on track for outstanding results.";
    if (percentage >= 70) return "Very good performance. Keep up the great work!";
    if (percentage >= 65) return "Good performance with room for improvement.";
    if (percentage >= 60) return "Satisfactory performance. Consider focusing on weak areas.";
    if (percentage >= 55) return "Average performance. Additional effort needed to improve.";
    if (percentage >= 50) return "Below average performance. Significant improvement required.";
    if (percentage >= 45) return "Poor performance. Extra support and effort needed.";
    if (percentage >= 40) return "Concerning performance. Immediate attention required.";
    if (percentage >= 35) return "Critical performance. Urgent intervention needed.";
    if (percentage >= 30) return "Very poor performance. Risk of failure.";
    if (percentage >= 25) return "Failing performance. Immediate action required.";
    return "Severe academic difficulty. Comprehensive support needed.";
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

  // Fetch existing subject data for a course
  const fetchSubjectData = async (courseId: string) => {
    try {
      const response = await fetch(`/api/student/subject-data/${user.id}/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.hours_studied !== null || data.teacher_quality !== null) {
          setSubjectData(prev => ({
            ...prev,
            [courseId]: {
              hoursStudied: data.hours_studied?.toString() || "",
              teacherQuality: data.teacher_quality || ""
            }
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch subject data:", error);
    }
  };

  // Submit subject data for a course
  const submitSubjectDataForCourse = async (courseId: string) => {
    const courseData = subjectData[courseId];
    if (!courseData || !courseData.hoursStudied || !courseData.teacherQuality) {
      toast({
        title: "Validation Error",
        description: "Please fill in both hours studied and teacher quality.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/student/subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: user.id,
          course_id: parseInt(courseId),
          hours_studied: parseFloat(courseData.hoursStudied),
          teacher_quality: courseData.teacherQuality
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message || "Study parameters updated successfully!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update parameters",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update parameters",
        variant: "destructive"
      });
    }
  };

  // Load subject data when a module is selected
  useEffect(() => {
    if (selectedModule && user?.id) {
      fetchSubjectData(selectedModule);
    }
  }, [selectedModule, user?.id]);

  // Performance history data for charts
  const performanceHistory = [
    { month: "Jan", quiz: 75, assignment: 80, midterm: 78 },
    { month: "Feb", quiz: 80, assignment: 85, midterm: 82 },
    { month: "Mar", quiz: 85, assignment: 88, midterm: 87 },
    { month: "Apr", quiz: 82, assignment: 90, midterm: 85 },
    { month: "May", quiz: 88, assignment: 92, midterm: 89 },
  ];

  // Remove hardcoded modules - now fetched from API

  const sidebarItems = [
    { id: "overview", label: "Dashboard Overview", icon: Home },
    { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
    { id: "subjects", label: "Subject-wise Insights", icon: BookOpen },
    { id: "alerts", label: "Alerts & Recommendations", icon: AlertTriangle },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ];

  // Function to convert percentage to grade letter
  const getGradeLetter = (percentage: number): string => {
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

  const handleUpdateProfileData = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!academicData.sleepHours || !academicData.physicalActivity || 
          !academicData.peerInfluence || !academicData.extracurricular || 
          !academicData.gender) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Map the form values to API format
      const peerInfluenceMap = {
        "negative": 0,
        "natural": 1,
        "positive": 2
      };

      const extracurricularMap = {
        "no": 0,
        "yes": 1
      };

      const genderMap = {
        "female": 0,
        "male": 1
      };

      // Prepare the request payload
      const payload = {
        student_id: user?.id, // Use actual user ID from auth store
        gender: genderMap[academicData.gender.toLowerCase()],
        peer_influence: peerInfluenceMap[academicData.peerInfluence.toLowerCase()],
        extracurricular_activities: extracurricularMap[academicData.extracurricular.toLowerCase()],
        physical_activity: parseInt(academicData.physicalActivity),
        sleep_hours: parseInt(academicData.sleepHours)
      };

      console.log("Sending payload:", payload); // Debug log

      // Make the API call
      const response = await axios.post('http://localhost:5000/api/student/common', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        setProfileIncomplete(false); // Reset profile incomplete state
        toast({
          title: "Profile Updated",
          description: "Your profile data has been updated successfully.",
        });
        // Refresh course data to get new predictions
        fetchStudentCourses();
      }

    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile data. Please try again.",
        variant: "destructive"
      });
    } finally {
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

  const fetchExistingCommonData = async () => {
    try {
      if (!user?.id) return;
      
      const response = await axios.get(`http://localhost:5000/api/student/common/${user.id}`);
      
      if (response.data) {
        // Map the API response back to form values
        const peerInfluenceReverseMap = { 0: "negative", 1: "natural", 2: "positive" };
        const extracurricularReverseMap = { 0: "no", 1: "yes" };
        const genderReverseMap = { 0: "female", 1: "male" };

        setAcademicData({
          sleepHours: response.data.sleep_hours?.toString() || "",
          physicalActivity: response.data.physical_activity?.toString() || "",
          extracurricular: extracurricularReverseMap[response.data.extracurricular_activities] || "",
          peerInfluence: peerInfluenceReverseMap[response.data.peer_influence] || "",
          gender: genderReverseMap[response.data.gender] || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch existing common data:", error);
      // Don't show error toast for this since it's optional
    }
  };

  useEffect(() => {
    fetchName();
  }, [username]);

  // Helper function to calculate current grade from available marks only
  const calculateCurrentGradeFromMarks = (marks) => {
    const availableMarks = [];
    if (marks.quiz1 !== null) availableMarks.push(marks.quiz1);
    if (marks.quiz2 !== null) availableMarks.push(marks.quiz2);
    if (marks.assignment1 !== null) availableMarks.push(marks.assignment1);
    if (marks.assignment2 !== null) availableMarks.push(marks.assignment2);
    if (marks.midterm !== null) availableMarks.push(marks.midterm);
    
    if (availableMarks.length === 0) return null;
    
    const total = availableMarks.reduce((sum, mark) => sum + mark, 0);
    return Math.round((total / availableMarks.length) * 100) / 100;
  };

  // Function to generate meaningful tips based on student's real data
  const generateQuickTips = () => {
    const tips = [];
    
    if (modules.length === 0) {
      return [{
        type: "info",
        icon: "Brain",
        title: "Get Started",
        message: "Enroll in courses to see personalized performance tips and recommendations.",
        color: "blue"
      }];
    }

    // Find courses that need attention (predicted grade < 65%)
    const strugglingCourses = modules.filter(m => m.predictedFinal < 65 && m.predictedFinal > 0);
    
    // Find courses performing well (predicted grade >= 80%)
    const excellentCourses = modules.filter(m => m.predictedFinal >= 80);
    
    // Find courses with low attendance (< 75%)
    const lowAttendanceCourses = modules.filter(m => m.attendance && m.attendance < 75);
    
    // Find courses with missing marks
    const coursesWithMissingMarks = modules.filter(m => {
      const marks = m.marks;
      return marks.quiz1 === null || marks.quiz2 === null || 
             marks.assignment1 === null || marks.assignment2 === null || 
             marks.midterm === null;
    });

    // Generate tips based on struggling courses
    if (strugglingCourses.length > 0) {
      const worstCourse = strugglingCourses.reduce((prev, current) => 
        prev.predictedFinal < current.predictedFinal ? prev : current
      );
      
      tips.push({
        type: "warning",
        icon: "AlertTriangle",
        title: `Focus on ${worstCourse.code}`,
        message: `Your predicted grade in ${worstCourse.name} is ${worstCourse.predictedFinal}%. Consider attending office hours and increasing study time.`,
        color: "yellow"
      });
    }

    // Generate tips for excellent performance
    if (excellentCourses.length > 0) {
      const bestCourse = excellentCourses.reduce((prev, current) => 
        prev.predictedFinal > current.predictedFinal ? prev : current
      );
      
      tips.push({
        type: "success",
        icon: "CheckCircle",
        title: `Excellent Work in ${bestCourse.code}!`,
        message: `You're performing exceptionally well in ${bestCourse.name} (${bestCourse.predictedFinal}%). Consider helping classmates or exploring advanced topics.`,
        color: "green"
      });
    }

    // Generate tips for attendance issues
    if (lowAttendanceCourses.length > 0) {
      const lowestAttendance = lowAttendanceCourses.reduce((prev, current) => 
        prev.attendance < current.attendance ? prev : current
      );
      
      tips.push({
        type: "warning",
        icon: "Clock",
        title: `Improve Attendance in ${lowestAttendance.code}`,
        message: `Your attendance in ${lowestAttendance.name} is ${lowestAttendance.attendance}%. Regular attendance significantly impacts academic performance.`,
        color: "orange"
      });
    }

    // Generate tips for missing assessments
    if (coursesWithMissingMarks.length > 0) {
      const courseWithMostMissing = coursesWithMissingMarks[0];
      const missingAssessments = [];
      
      if (courseWithMostMissing.marks.quiz1 === null) missingAssessments.push("Quiz 1");
      if (courseWithMostMissing.marks.quiz2 === null) missingAssessments.push("Quiz 2");
      if (courseWithMostMissing.marks.assignment1 === null) missingAssessments.push("Assignment 1");
      if (courseWithMostMissing.marks.assignment2 === null) missingAssessments.push("Assignment 2");
      if (courseWithMostMissing.marks.midterm === null) missingAssessments.push("Midterm");

      tips.push({
        type: "info",
        icon: "FileText",
        title: `Pending Assessments in ${courseWithMostMissing.code}`,
        message: `${missingAssessments.join(", ")} not yet graded in ${courseWithMostMissing.name}. Contact your lecturer for updates.`,
        color: "blue"
      });
    }

    // Generate general performance tip
    const overallAverage = modules.length > 0 ? 
      modules.reduce((sum, m) => sum + m.predictedFinal, 0) / modules.length : 0;
    
    if (overallAverage > 0 && overallAverage < 70 && tips.length < 2) {
      tips.push({
        type: "info",
        icon: "TrendingUp",
        title: "Boost Your Overall Performance",
        message: `Your overall predicted average is ${overallAverage.toFixed(1)}%. Consider creating a structured study schedule and utilizing available academic resources.`,
        color: "blue"
      });
    }

    // If no specific tips, provide encouragement
    if (tips.length === 0) {
      tips.push({
        type: "success",
        icon: "Target",
        title: "Keep Up the Great Work!",
        message: "You're performing well across all your courses. Maintain your current study habits and stay consistent.",
        color: "green"
      });
    }

    // Limit to maximum 2 tips to avoid clutter
    return tips.slice(0, 2);
  };

  // Function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Brain: Brain,
      AlertTriangle: AlertTriangle,
      CheckCircle: CheckCircle,
      Clock: Clock,
      FileText: FileText,
      TrendingUp: TrendingUp,
      Target: Target,
    };
    return iconMap[iconName] || Brain;
  };

  // Function to get color classes by type
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-900/20",
        border: "border-blue-600/30",
        iconColor: "text-blue-400",
        titleColor: "text-blue-300",
        textColor: "text-blue-200"
      },
      green: {
        bg: "bg-green-900/20",
        border: "border-green-600/30",
        iconColor: "text-green-400",
        titleColor: "text-green-300",
        textColor: "text-green-200"
      },
      yellow: {
        bg: "bg-yellow-900/20",
        border: "border-yellow-600/30",
        iconColor: "text-yellow-400",
        titleColor: "text-yellow-300",
        textColor: "text-yellow-200"
      },
      orange: {
        bg: "bg-orange-900/20",
        border: "border-orange-600/30",
        iconColor: "text-orange-400",
        titleColor: "text-orange-300",
        textColor: "text-orange-200"
      }
    };
    return colorMap[color] || colorMap.blue;
  };

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
              {calculateOverallAttendance() !== null ? `${calculateOverallAttendance()}%` : 'N/A'}
            </div>
            <div className="text-sm text-blue-200">Overall Attendance</div>
          </div>
        </div>
      </div>

      {/* Profile Incomplete Warning */}
      {profileIncomplete && (
        <Alert className="bg-yellow-900/20 border-yellow-600/30">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-yellow-300">Complete Your Profile</AlertTitle>
          <AlertDescription className="text-yellow-200">
            Your profile data is incomplete. Complete your profile to get accurate AI predictions for your courses.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 border-yellow-600 text-yellow-300 hover:bg-yellow-600 hover:text-white"
              onClick={() => setActiveSection("profile")}
            >
              Update Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alert System */}
      <AlertSystem userId={user?.id} userType="student" />

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
                      value={module.predictedFinal}
                      className="w-20 h-2"
                    />
                    <span className="text-white text-sm font-medium">
                      {module.predictedFinal}%
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
              {generateQuickTips().map((tip, index) => {
                const Icon = getIconComponent(tip.type);
                const colorClasses = getColorClasses(tip.type);
                
                return (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${colorClasses.background} ${colorClasses.border}`}>
                    <Icon className={`w-5 h-5 mt-0.5 ${colorClasses.icon}`} />
                    <div>
                      <p className={`font-medium ${colorClasses.title}`}>
                        {tip.title}
                      </p>
                      <p className={`text-sm ${colorClasses.text}`}>
                        {tip.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              {generateQuickTips().length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400">Great work! No specific tips needed at the moment.</p>
                </div>
              )}
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
                  grade: m.predictedFinal,
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Predicted Final:</span>
                  <span className="font-medium text-purple-400">
                    {module.predictedFinal > 0 
                      ? `${module.predictedGrade} (${module.predictedFinal}%)` 
                      : "Pending assessments"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Attendance Rate:</span>
                  <span className={`font-medium ${
                    module.attendance === null 
                      ? 'text-gray-400' 
                      : module.attendance >= 90 
                      ? 'text-green-400' 
                      : module.attendance >= 75 
                      ? 'text-yellow-400' 
                      : 'text-red-400'
                  }`}>
                    {module.attendance !== null ? `${module.attendance}%` : 'Not Set'}
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
                          onClick={() => submitSubjectDataForCourse(module.id)}
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
                            <span className="text-gray-300">Attendance Rate:</span>
                            <span className={`font-medium ${
                              module.attendance === null 
                                ? 'text-gray-400' 
                                : module.attendance >= 90 
                                ? 'text-green-400' 
                                : module.attendance >= 75 
                                ? 'text-yellow-400' 
                                : 'text-red-400'
                            }`}>
                              {module.attendance !== null ? `${module.attendance}%` : 'Not Set'}
                            </span>
                          </div>
                          {module.attendance !== null && (
                            <div className="mt-2">
                              <Progress value={module.attendance} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                          <p className="text-sm text-gray-300">
                            {module.attendance === null
                              ? "Attendance not yet recorded by admin."
                              : module.attendance >= 90 
                              ? "Excellent attendance! Keep it up."
                              : module.attendance >= 75 
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
                            {module.marks.quiz1 !== null ? module.marks.quiz1 : "Not Given"}
                          </div>
                          <div className="text-sm text-gray-300">Quiz 1</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">
                            {module.marks.quiz2 !== null ? module.marks.quiz2 : "Not Given"}
                          </div>
                          <div className="text-sm text-gray-300">Quiz 2</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">
                            {module.marks.assignment1 !== null ? module.marks.assignment1 : "Not Given"}
                          </div>
                          <div className="text-sm text-gray-300">Assignment 1</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">
                            {module.marks.assignment2 !== null ? module.marks.assignment2 : "Not Given"}
                          </div>
                          <div className="text-sm text-gray-300">Assignment 2</div>
                        </div>
                        <div className="text-center p-3 bg-gray-600 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">
                            {module.marks.midterm !== null ? module.marks.midterm : "Not Given"}
                          </div>
                          <div className="text-sm text-gray-300">Midterm</div>
                        </div>
                      </div>
                      
                      {/* Note about missing marks */}
                      {(module.marks.quiz1 === null || module.marks.quiz2 === null || 
                        module.marks.assignment1 === null || module.marks.assignment2 === null || 
                        module.marks.midterm === null) && (
                        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                          <p className="text-yellow-300 text-sm">
                            ⚠️ Some assessment marks are not yet available. AI predictions will be more accurate once all assessments are completed by your lecturer.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Prediction Section */}
                  <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">AI Prediction Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profileIncomplete ? (
                        /* Profile Incomplete Message */
                        <div className="text-center space-y-4 py-8">
                          <div className="text-6xl">⚠️</div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-yellow-300">Profile Data Required</h3>
                            <p className="text-gray-300 text-sm max-w-md mx-auto">
                              Please complete your profile data to get accurate AI predictions. 
                              Update your gender, peer influence, extracurricular activities, physical activity, and sleep hours in the Profile section.
                            </p>
                          </div>
                          <Button 
                            onClick={() => setActiveSection("profile")}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Complete Profile
                          </Button>
                        </div>
                      ) : (
                        /* Normal Prediction Display */
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
                      )}
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
                Your performance in {module.name} needs improvement. Predicted
                grade: {module.predictedFinal}%
              </AlertDescription>
            </Alert>
          ))}
      </div>

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
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
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
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
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
              onClick={handleUpdateProfileData} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update profile data'}
            </Button>

            
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loadingCourses) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-white text-lg">Loading your courses...</div>
        </div>
      );
    }

    if (modules.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Courses Enrolled
          </h3>
          <p className="text-gray-400">
            You are not enrolled in any courses yet. Please contact your administrator.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "analytics":
        return renderAnalytics();
      case "subjects":
        return renderSubjects();
      case "alerts":
        return renderAlerts();
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
              {/* Removed notification bell */}
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