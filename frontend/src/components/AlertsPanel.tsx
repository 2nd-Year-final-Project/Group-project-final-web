import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import axios from 'axios';

const AlertsPanel = ({ studentId, courseId = null }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, critical
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, severity

  useEffect(() => {
    fetchAlerts();
  }, [studentId, courseId, filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseId) params.append('course_id', courseId);
      if (filter === 'unread') params.append('unread_only', 'true');
      
      const response = await axios.get(`/api/alerts/student/${studentId}?${params}`);
      setAlerts(response.data.alerts);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await axios.post(`/api/alerts/mark-read/${alertId}`, {
        user_id: studentId,
        is_lecturer: false
      });
      
      // Update local state
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
        user_id: studentId,
        is_lecturer: false
      });
      
      // Update local state
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
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
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

  const getAlertTypeEmoji = (alertType) => {
    switch (alertType) {
      case 'at_risk':
        return '🚨';
      case 'excellent':
        return '🌟';
      case 'good':
        return '✅';
      case 'average':
        return '📊';
      case 'poor_quiz':
        return '📝';
      case 'poor_assignment':
        return '📋';
      case 'poor_midterm':
        return '📖';
      case 'low_attendance':
        return '📅';
      case 'motivational':
        return '💪';
      default:
        return '📢';
    }
  };

  const filteredAndSortedAlerts = alerts
    .filter(alert => {
      if (filter === 'unread') return !alert.is_read;
      if (filter === 'critical') return alert.severity === 'critical' || alert.severity === 'high';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'severity') {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return 0;
    });

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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Alerts & Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <Button 
              onClick={fetchAlerts} 
              variant="outline" 
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
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
                variant={filter === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('critical')}
              >
                Critical
              </Button>
            </div>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">By Severity</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAndSortedAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center p-6">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread alerts' : 'No alerts to show'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedAlerts.map((alert) => (
            <Card key={alert.id} className={`transition-all duration-200 ${
              !alert.is_read ? 'ring-2 ring-blue-200 bg-blue-50' : ''
            } ${alert.is_resolved ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getAlertTypeEmoji(alert.alert_type)}</span>
                          <Badge className={getSeverityBadgeColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
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
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium">{alert.course_name}</span>
                          {alert.predicted_grade && (
                            <span>Predicted Grade: {alert.predicted_grade}</span>
                          )}
                          {alert.predicted_marks && (
                            <span>Predicted Marks: {alert.predicted_marks}%</span>
                          )}
                        </div>
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

export default AlertsPanel;
