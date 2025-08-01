import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, Mail, Phone, TrendingDown } from 'lucide-react';

interface AtRiskStudent {
  id: number;
  student_name: string;
  course_code: string;
  course_name: string;
  predicted_grade: number;
  predicted_percentage: number;
  risk_level: 'medium' | 'high' | 'critical';
  alert_message: string;
  created_at: string;
}

interface LecturerDashboardAlertsProps {
  lecturerId: number | string | undefined;
}

const LecturerDashboardAlerts: React.FC<LecturerDashboardAlertsProps> = ({ lecturerId }) => {
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtRiskStudents();
  }, [lecturerId]);

  const fetchAtRiskStudents = async () => {
    if (!lecturerId) return;
    
    try {
      const response = await fetch(`/api/alerts/lecturer/${lecturerId}/at-risk`);
      if (response.ok) {
        const data = await response.json();
        setAtRiskStudents(data.atRiskStudents);
      }
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-600 text-red-100';
      case 'high':
        return 'bg-orange-600 text-orange-100';
      case 'medium':
        return 'bg-yellow-600 text-yellow-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'high':
        return <TrendingDown className="h-5 w-5 text-orange-400" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 50) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            At-Risk Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading at-risk students...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          At-Risk Students
          {atRiskStudents.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {atRiskStudents.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {atRiskStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-300 text-lg">All students on track!</p>
            <p className="text-gray-400 text-sm">No students currently at risk in your courses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {atRiskStudents.map((student, index) => (
              <Alert key={`${student.id}-${student.course_code}-${index}`} className="bg-gray-700 border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getRiskIcon(student.risk_level)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white text-sm">{student.student_name}</h4>
                        <Badge className={getRiskColor(student.risk_level)} variant="secondary">
                          {student.risk_level} risk
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-blue-300 mb-2">
                        <span className="font-medium">{student.course_code}:</span> {student.course_name}
                      </div>
                      
                      <AlertDescription className="text-gray-300 text-sm mb-3">
                        {student.alert_message}
                      </AlertDescription>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`border-current ${getGradeColor(student.predicted_percentage)}`}>
                            Predicted: {student.predicted_percentage}%
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
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-400 border-green-400 hover:bg-green-600 hover:text-white"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
            
            {atRiskStudents.length > 0 && (
              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                <h4 className="font-medium text-blue-300 mb-2">💡 Intervention Recommendations:</h4>
                <ul className="space-y-1 text-blue-200 text-sm">
                  <li>• Schedule one-on-one meetings with at-risk students</li>
                  <li>• Provide additional study materials and resources</li>
                  <li>• Consider extending assignment deadlines or offering extra credit</li>
                  <li>• Connect students with tutoring services or study groups</li>
                  <li>• Monitor progress more frequently and provide regular feedback</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LecturerDashboardAlerts;
