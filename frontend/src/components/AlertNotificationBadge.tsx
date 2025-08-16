import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface AlertNotificationBadgeProps {
  userId: number | string | undefined;
  userType: 'student' | 'lecturer';
  className?: string;
}

const AlertNotificationBadge: React.FC<AlertNotificationBadgeProps> = ({ 
  userId, 
  userType,
  className = "" 
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
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

    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [userId, userType]);

  if (!userId || unreadCount === 0) {
    return (
      <Bell className={`w-5 h-5 text-gray-400 ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5 text-blue-400" />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    </div>
  );
};

export default AlertNotificationBadge;
