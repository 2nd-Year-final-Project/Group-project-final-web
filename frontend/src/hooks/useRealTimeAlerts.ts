import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useRealTimeAlerts = (userId, isLecturer = false) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newAlertReceived, setNewAlertReceived] = useState(false);

  // Fetch alerts from server
  const fetchAlerts = useCallback(async () => {
    try {
      const endpoint = isLecturer 
        ? `/api/alerts/lecturer/${userId}` 
        : `/api/alerts/student/${userId}`;
      
      const response = await axios.get(endpoint);
      setAlerts(response.data.alerts);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isLecturer]);

  // Poll for new alerts every 30 seconds
  const startPolling = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const endpoint = isLecturer 
          ? `/api/alerts/lecturer/${userId}` 
          : `/api/alerts/student/${userId}`;
        
        const response = await axios.get(`${endpoint}?unread_only=true`);
        const newUnreadCount = response.data.unreadCount;
        
        // If unread count increased, we have new alerts
        if (newUnreadCount > unreadCount) {
          setNewAlertReceived(true);
          setUnreadCount(newUnreadCount);
          
          // Show browser notification if supported and permitted
          showBrowserNotification(response.data.alerts[0]);
          
          // Auto-clear the new alert indicator after 5 seconds
          setTimeout(() => setNewAlertReceived(false), 5000);
        }
      } catch (error) {
        console.error('Error polling for alerts:', error);
      }
    }, 30000); // Poll every 30 seconds

    return interval;
  }, [userId, isLecturer, unreadCount]);

  // Show browser notification
  const showBrowserNotification = (alert) => {
    if (!alert) return;
    
    // Check if browser supports notifications
    if ('Notification' in window) {
      // Request permission if not already granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Show notification if permission granted
      if (Notification.permission === 'granted') {
        const notification = new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `alert-${alert.id}`,
          requireInteraction: alert.severity === 'critical'
        });
        
        // Auto-close after 10 seconds unless it's critical
        if (alert.severity !== 'critical') {
          setTimeout(() => notification.close(), 10000);
        }
        
        // Handle click to focus window
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }
  };

  // Mark alert as read
  const markAsRead = async (alertId) => {
    try {
      await axios.post(`/api/alerts/mark-read/${alertId}`, {
        user_id: userId,
        is_lecturer: isLecturer
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Mark alert as resolved
  const markAsResolved = async (alertId) => {
    try {
      await axios.post(`/api/alerts/mark-resolved/${alertId}`, {
        user_id: userId,
        is_lecturer: isLecturer
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
    }
  };

  // Get alert statistics
  const getAlertStatistics = async () => {
    try {
      const endpoint = isLecturer 
        ? `/api/alerts/lecturer/${userId}/statistics` 
        : `/api/alerts/student/${userId}/statistics`;
      
      const response = await axios.get(`${endpoint}?is_lecturer=${isLecturer}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert statistics:', error);
      return {};
    }
  };

  // Initialize
  useEffect(() => {
    fetchAlerts();
    const pollInterval = startPolling();
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchAlerts, startPolling]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    alerts,
    unreadCount,
    loading,
    newAlertReceived,
    markAsRead,
    markAsResolved,
    fetchAlerts,
    getAlertStatistics,
    refreshAlerts: fetchAlerts
  };
};

export default useRealTimeAlerts;
