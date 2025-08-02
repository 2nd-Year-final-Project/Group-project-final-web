import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, X, AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardAlert {
  id: number;
  alert_type: 'performance' | 'improvement' | 'warning' | 'excellent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  predicted_grade: number;
  predicted_percentage: number;
  course_name: string;
  course_code: string;
  is_read: boolean;
  created_at: string;
}

interface StudentDashboardAlertsProps {
  studentId: number | string | undefined;
}

const StudentDashboardAlerts: React.FC<StudentDashboardAlertsProps> = ({ studentId }) => {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardAlerts();
  }, [studentId]);

  const fetchDashboardAlerts = async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/alerts/student/${studentId}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: studentId }),
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (type === 'excellent') return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (type === 'performance') return <TrendingUp className="h-5 w-5 text-blue-400" />;
    if (severity === 'critical') return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (severity === 'high') return <AlertCircle className="h-5 w-5 text-orange-400" />;
    return <Bell className="h-5 w-5 text-yellow-400" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'excellent':
        return 'bg-green-600 text-green-100';
      case 'performance':
        return 'bg-blue-600 text-blue-100';
      case 'improvement':
        return 'bg-yellow-600 text-yellow-100';
      case 'warning':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getGradeFromPercentage = (percentage: number): string => {
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

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading alerts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Performance Alerts
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-300 text-lg">All caught up!</p>
            <p className="text-gray-400 text-sm">No performance alerts at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="bg-gray-700 border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.alert_type, alert.severity)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white text-sm">{alert.title}</h4>
                        <Badge className={getTypeColor(alert.alert_type)} variant="secondary">
                          {alert.alert_type}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-blue-300 mb-2">
                        <span className="font-medium">{alert.course_code}:</span> {alert.course_name}
                      </div>
                      
                      <AlertDescription className="text-gray-300 text-sm mb-3">
                        {alert.message}
                      </AlertDescription>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-purple-400 border-purple-400">
                            <span className="text-xl font-extrabold">{getGradeFromPercentage(alert.predicted_percentage)}</span>
                            <span className="text-sm font-normal opacity-75 ml-1">({alert.predicted_percentage}%)</span>
                          </Badge>
                          <div className="text-xs text-gray-400">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-white hover:bg-gray-600 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentDashboardAlerts;
