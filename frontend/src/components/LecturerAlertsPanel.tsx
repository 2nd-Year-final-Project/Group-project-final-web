import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Users, BookOpen, Clock, Eye, CheckCircle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import axios from 'axios';

const LecturerAlertsPanel = ({ lecturerId }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, action_required
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, [lecturerId, filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unread_only', 'true');
      if (filter === 'action_required') params.append('action_required', 'true');
      
      const response = await axios.get(`/api/alerts/lecturer/${lecturerId}?${params}`);
      setAlerts(response.data.alerts);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching lecturer alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`/api/alerts/lecturer/${lecturerId}/statistics?is_lecturer=true`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await axios.post(`/api/alerts/mark-read/${alertId}`, {
        user_id: lecturerId,
        is_lecturer: true
      });
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAsResolved = async (alertId) => {
    try {
      await axios.post(`/api/alerts/mark-resolved/${alertId}`, {
        user_id: lecturerId,
        is_lecturer: true
      });
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Users className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      default:
        return <Users className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAlertTypeIcon = (alertType) => {
    switch (alertType) {
      case 'student_at_risk':
        return '🚨';
      case 'student_improvement_needed':
        return '⚠️';
      case 'student_excelling':
        return '🌟';
      case 'low_class_attendance':
        return '📅';
      case 'poor_assignment_performance':
        return '📋';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInHours = Math.floor((now - alertDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return alertDate.toLocaleDateString();
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'action_required') return alert.action_required && !alert.is_resolved;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{statistics.total_alerts || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.unread_alerts || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{statistics.critical_alerts || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk Students</p>
                <p className="text-2xl font-bold text-red-600">{statistics.at_risk_students || 0}</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Student Alerts & Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <Button onClick={fetchAlerts} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({alerts.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'action_required' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('action_required')}
            >
              Action Required ({alerts.filter(a => a.action_required && !a.is_resolved).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center p-6">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No alerts to show</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`transition-all duration-200 ${
              !alert.is_read ? 'ring-2 ring-blue-200 bg-blue-50' : ''
            } ${alert.is_resolved ? 'opacity-60' : ''} ${
              alert.action_required ? 'border-l-4 border-l-red-500' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getAlertTypeIcon(alert.alert_type)}</span>
                          <Badge className={getSeverityBadgeColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.action_required && (
                            <Badge variant="destructive">
                              ACTION REQUIRED
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.created_at)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {alert.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.message}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Student:</span> {alert.student_name}
                          </div>
                          <div>
                            <span className="font-medium">Course:</span> {alert.course_name}
                          </div>
                          {alert.predicted_grade && (
                            <div>
                              <span className="font-medium">Predicted Grade:</span> {alert.predicted_grade}
                            </div>
                          )}
                          {alert.predicted_marks && (
                            <div>
                              <span className="font-medium">Predicted Marks:</span> {alert.predicted_marks}%
                            </div>
                          )}
                        </div>

                        {alert.action_required && !alert.is_resolved && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800 font-medium">
                              Recommended Actions:
                            </p>
                            <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                              <li>Contact the student for a one-on-one meeting</li>
                              <li>Review their recent performance and attendance</li>
                              <li>Develop an improvement plan with specific goals</li>
                              <li>Consider referring to academic support services</li>
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!alert.is_read && (
                          <Button
                            onClick={() => markAsRead(alert.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {!alert.is_resolved && (
                          <Button
                            onClick={() => markAsResolved(alert.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Mark as resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {alert.is_resolved && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Resolved
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LecturerAlertsPanel;
