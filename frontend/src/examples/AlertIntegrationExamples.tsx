import React from 'react';
import AlertsPanel from '../components/AlertsPanel';
import NotificationBell from '../components/NotificationBell';
import AlertPreferences from '../components/AlertPreferences';
import useRealTimeAlerts from '../hooks/useRealTimeAlerts';

// Example: Enhanced Student Dashboard with Alerts
const EnhancedStudentDashboard = ({ studentId }) => {
  const { unreadCount } = useRealTimeAlerts(studentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header with Notification Bell */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time notification bell */}
              <NotificationBell userId={studentId} />
              <div className="h-6 w-6 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Alert Banner for Critical Alerts */}
          {unreadCount > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">🚨</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    You have {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Please review your alerts below for important updates about your academic performance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Existing Dashboard Components */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Course Performance
                  </h3>
                  {/* Your existing course performance charts/tables */}
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">Course Performance Charts</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Grades
                  </h3>
                  {/* Your existing grades table */}
                  <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">Recent Grades Table</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Alerts Panel */}
            <div className="space-y-6">
              <AlertsPanel studentId={studentId} />
            </div>
          </div>

          {/* Settings Section */}
          <div className="mt-8">
            <AlertPreferences userId={studentId} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Example: Enhanced Lecturer Dashboard with Alerts
const EnhancedLecturerDashboard = ({ lecturerId }) => {
  const { unreadCount, alerts } = useRealTimeAlerts(lecturerId, true);
  
  // Get critical alerts that need immediate attention
  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'critical' && alert.action_required && !alert.is_resolved
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Lecturer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell userId={lecturerId} isLecturer={true} />
              <div className="h-6 w-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-600">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <span className="flex p-2 rounded-lg bg-red-800">
                  <span className="text-white text-lg">🚨</span>
                </span>
                <p className="ml-3 font-medium text-white truncate">
                  <span className="md:hidden">
                    {criticalAlerts.length} students need immediate attention
                  </span>
                  <span className="hidden md:inline">
                    {criticalAlerts.length} students require immediate intervention - please review alerts below
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Students
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            24
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            At Risk Students
                          </dt>
                          <dd className="text-lg font-medium text-red-600">
                            {criticalAlerts.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">📧</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Unread Alerts
                          </dt>
                          <dd className="text-lg font-medium text-orange-600">
                            {unreadCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Course Management Components */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Course Management
                  </h3>
                  {/* Your existing course management interface */}
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">Course Management Interface</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Alerts Panel */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                      🔔 Student Alerts
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {unreadCount}
                        </span>
                      )}
                    </h3>
                    
                    {/* Quick action alerts */}
                    {criticalAlerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start">
                          <span className="text-red-500 mr-2">🚨</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-800">
                              {alert.student_name}
                            </p>
                            <p className="text-xs text-red-600 truncate">
                              {alert.course_name} - {alert.title}
                            </p>
                            <button className="mt-1 text-xs text-red-700 hover:text-red-900 font-medium">
                              Take Action →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      View All Alerts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example: Alert Widget for Quick Integration
const AlertWidget = ({ userId, isLecturer = false, maxAlerts = 3 }) => {
  const { alerts, unreadCount, markAsRead } = useRealTimeAlerts(userId, isLecturer);
  
  const recentAlerts = alerts
    .filter(alert => !alert.is_read)
    .slice(0, maxAlerts);

  if (recentAlerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          🔔 Recent Alerts
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {unreadCount}
          </span>
        </h3>
      </div>
      
      <div className="space-y-2">
        {recentAlerts.map(alert => (
          <div 
            key={alert.id} 
            className="flex items-start p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
            onClick={() => markAsRead(alert.id)}
          >
            <span className="mr-2">
              {alert.severity === 'critical' ? '🚨' : 
               alert.severity === 'high' ? '⚠️' : 
               alert.severity === 'medium' ? '📊' : '✅'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {alert.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isLecturer ? alert.student_name : alert.course_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { 
  EnhancedStudentDashboard, 
  EnhancedLecturerDashboard, 
  AlertWidget 
};
