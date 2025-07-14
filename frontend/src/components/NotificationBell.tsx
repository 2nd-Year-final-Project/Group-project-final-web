import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import useRealTimeAlerts from '../hooks/useRealTimeAlerts';

const NotificationBell = ({ userId, isLecturer = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { alerts, unreadCount, newAlertReceived, markAsRead } = useRealTimeAlerts(userId, isLecturer);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get recent unread alerts (last 5)
  const recentUnreadAlerts = alerts
    .filter(alert => !alert.is_read)
    .slice(0, 5);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-blue-600';
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
    const diffInMinutes = Math.floor((now - alertDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`relative p-2 ${newAlertReceived ? 'animate-pulse' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={`h-5 w-5 ${newAlertReceived ? 'text-red-500' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-sm z-50">
          <Card className="shadow-lg border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Notifications
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {recentUnreadAlerts.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentUnreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => markAsRead(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-lg">{getAlertTypeEmoji(alert.alert_type)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(alert.created_at)}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                            {alert.title}
                          </h4>
                          
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {alert.message}
                          </p>
                          
                          {(alert.course_name || alert.student_name) && (
                            <div className="mt-1 text-xs text-gray-500">
                              {alert.course_name && (
                                <span className="font-medium">{alert.course_name}</span>
                              )}
                              {alert.student_name && (
                                <span className="font-medium">Student: {alert.student_name}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {recentUnreadAlerts.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to full alerts page
                      window.location.href = isLecturer ? '/lecturer/alerts' : '/student/alerts';
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
