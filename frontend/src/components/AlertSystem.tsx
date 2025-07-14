import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Bell, X, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AlertData {
  id: number;
  student_id: number;
  course_id: number;
  lecturer_id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  predicted_grade: number;
  current_average: number;
  risk_factors: string;
  recommendations: string;
  is_read_by_student: boolean;
  is_read_by_lecturer: boolean;
  is_read_by_admin: boolean;
  is_resolved: boolean;
  created_at: string;
  course_name?: string;
  course_code?: string;
  student_name?: string;
  student_email?: string;
  lecturer_name?: string;
}

interface AlertSystemProps {
  userRole: 'student' | 'lecturer' | 'admin';
  userId: number;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ userRole, userId }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalActive: 0,
    critical: 0,
    high: 0,
    medium: 0
  });
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Fetch alerts based on user role
  const fetchAlerts = async () => {
    try {
      let endpoint = '';
      if (userRole === 'student') {
        endpoint = `/api/alerts/student/${userId}`;
      } else if (userRole === 'lecturer') {
        endpoint = `/api/alerts/lecturer/${userId}`;
      } else if (userRole === 'admin') {
        endpoint = `/api/alerts/admin`;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive"
      });
    }
  };

  // Fetch alert statistics (for admin/lecturer)
  const fetchStatistics = async () => {
    if (userRole === 'student') return;
    
    try {
      const response = await fetch('/api/alerts/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Mark alert as read
  const markAsRead = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userRole })
      });

      if (response.ok) {
        // Update local state
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                [`is_read_by_${userRole}`]: true 
              }
            : alert
        ));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Mark alert as resolved (lecturer/admin only)
  const markAsResolved = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST'
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        toast({
          title: "Success",
          description: "Alert marked as resolved"
        });
      }
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  // Run manual alert check (admin only)
  const runAlertCheck = async () => {
    if (userRole !== 'admin') return;
    
    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST'
      });

      if (response.ok) {
        await fetchAlerts();
        await fetchStatistics();
        toast({
          title: "Success",
          description: "Alert check completed"
        });
      }
    } catch (error) {
      console.error('Error running alert check:', error);
      toast({
        title: "Error",
        description: "Failed to run alert check",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAlerts();
      await fetchStatistics();
      setLoading(false);
    };
    
    loadData();
  }, [userRole, userId]);

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Get alert icon
  const getAlertIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Bell className="w-5 h-5 text-yellow-500" />;
  };

  // Filter alerts by severity
  const filteredAlerts = selectedSeverity === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === selectedSeverity);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      {userRole !== 'student' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{statistics.totalActive}</div>
              <div className="text-sm text-gray-400">Total Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">{statistics.critical}</div>
              <div className="text-sm text-gray-400">Critical</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">{statistics.high}</div>
              <div className="text-sm text-gray-400">High</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{statistics.medium}</div>
              <div className="text-sm text-gray-400">Medium</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 items-center">
        {userRole === 'admin' && (
          <Button onClick={runAlertCheck} className="bg-blue-600 hover:bg-blue-700">
            Run Alert Check
          </Button>
        )}
        
        {/* Severity Filter */}
        <div className="flex gap-2">
          <Button 
            variant={selectedSeverity === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity('all')}
          >
            All
          </Button>
          <Button 
            variant={selectedSeverity === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity('critical')}
            className="border-red-600 text-red-300"
          >
            Critical
          </Button>
          <Button 
            variant={selectedSeverity === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity('high')}
            className="border-orange-600 text-orange-300"
          >
            High
          </Button>
          <Button 
            variant={selectedSeverity === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity('medium')}
            className="border-yellow-600 text-yellow-300"
          >
            Medium
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {userRole === 'student' ? 'Your Alerts' : 
             userRole === 'lecturer' ? 'Student Alerts' : 
             'System Alerts'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {filteredAlerts.length} active alert{filteredAlerts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-300">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const isRead = userRole === 'student' ? alert.is_read_by_student :
                              userRole === 'lecturer' ? alert.is_read_by_lecturer :
                              alert.is_read_by_admin;

                return (
                  <Alert key={alert.id} className={`border-l-4 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-900/10' :
                    alert.severity === 'high' ? 'border-l-orange-500 bg-orange-900/10' :
                    alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-900/10' :
                    'border-l-blue-500 bg-blue-900/10'
                  } ${isRead ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert.severity)}
                        <div className="flex-1">
                          <AlertTitle className="text-white flex items-center gap-2">
                            {userRole !== 'student' && alert.student_name && (
                              <span>{alert.student_name}</span>
                            )}
                            {alert.course_name && (
                              <span className="text-sm text-gray-400">({alert.course_code})</span>
                            )}
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="text-gray-300 mt-2">
                            <div className="space-y-2">
                              <p><strong>Predicted Grade:</strong> {alert.predicted_grade}%</p>
                              <p><strong>Current Average:</strong> {alert.current_average}%</p>
                              {alert.risk_factors && (
                                <p><strong>Risk Factors:</strong> {alert.risk_factors}</p>
                              )}
                              {alert.recommendations && (
                                <p><strong>Recommendations:</strong> {alert.recommendations}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Created: {new Date(alert.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </AlertDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(alert.id)}
                            className="border-gray-600 text-gray-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {(userRole === 'lecturer' || userRole === 'admin') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsResolved(alert.id)}
                            className="border-green-600 text-green-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSystem;
