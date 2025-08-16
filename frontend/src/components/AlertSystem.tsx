import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, X, Check, AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface AlertData {
  id: number;
  alert_type: 'performance' | 'grade_prediction' | 'improvement' | 'warning' | 'excellent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  predicted_grade: number;
  predicted_percentage: number;
  course_name: string;
  course_code: string;
  student_name: string;
  is_read: boolean;
  created_at: string;
}

interface AlertSystemProps {
  userId: number | string | undefined;
  userType: 'student' | 'lecturer';
}

const AlertSystem: React.FC<AlertSystemProps> = ({ userId, userType }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();
  }, [userId, userType]);

  const fetchAlerts = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/alerts/user/${userId}?userType=${userType}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/alerts/user/${userId}/unread-count?userType=${userType}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, is_read: true } : alert
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const dismissAlert = async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        setUnreadCount(prev => {
          const alert = alerts.find(a => a.id === alertId);
          return alert && !alert.is_read ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getAlertIcon = (alertType: string, severity: string) => {
    switch (alertType) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'improvement':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'warning':
        return <AlertTriangle className={`w-5 h-5 ${severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCardBorderColor = (alertType: string, severity: string) => {
    if (severity === 'critical') return 'border-red-500';
    if (severity === 'high') return 'border-orange-500';
    if (alertType === 'excellent') return 'border-green-500';
    if (alertType === 'performance') return 'border-blue-500';
    return 'border-gray-600';
  };

  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 3);

  // Don't render if no userId
  if (!userId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {userType === 'student' ? 'Performance Alerts' : 'Student Alerts'}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No alerts at this time</p>
          </div>
        ) : (
          <>
            {displayedAlerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${getCardBorderColor(alert.alert_type, alert.severity)} ${
                  !alert.is_read ? 'bg-gray-700/50' : 'bg-gray-800/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.alert_type, alert.severity)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-white">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {!!alert.predicted_percentage && (
                          <Badge variant="outline" className="text-purple-400 border-purple-400">
                            {alert.predicted_percentage}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <span className="font-medium">{alert.course_code}:</span> {alert.course_name}
                        {userType === 'lecturer' && (
                          <span className="ml-2">
                            • <span className="font-medium">{alert.student_name}</span>
                          </span>
                        )}
                      </div>
                      
                      <AlertDescription className="text-gray-300 text-sm">
                        {alert.message}
                      </AlertDescription>
                      
                      <div className="text-xs text-gray-400">
                        {new Date(alert.created_at).toLocaleDateString()} • {new Date(alert.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(alert.id)}
                        className="h-6 px-2 text-xs text-green-400 hover:text-green-300"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
            
            {alerts.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-blue-400 hover:text-blue-300"
                onClick={() => setShowAllAlerts(!showAllAlerts)}
              >
                {showAllAlerts ? 'Show Less' : `Show All ${alerts.length} Alerts`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertSystem;
