import React, { useState, useEffect } from 'react';
import { Settings, Bell, Mail, Smartphone, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import axios from 'axios';

const AlertPreferences = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    at_risk_alerts: true,
    performance_alerts: true,
    attendance_alerts: true,
    grade_prediction_alerts: true,
    motivational_alerts: true,
    alert_frequency: 'immediate'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/alerts/preferences/${userId}`);
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await axios.put(`/api/alerts/preferences/${userId}`, preferences);
      setMessage('Preferences saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFrequencyChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      alert_frequency: value
    }));
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Alert Preferences</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Customize how and when you receive alerts about your academic performance
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Notification Methods */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Methods
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive alerts via email for critical and high priority alerts
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handleSwitchChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive real-time notifications in the application
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => handleSwitchChange('push_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <hr />

        {/* Alert Types */}
        <div>
          <h3 className="text-lg font-medium mb-4">Alert Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="at-risk-alerts" className="text-sm font-medium">
                  At Risk Alerts 🚨
                </Label>
                <p className="text-xs text-gray-500">
                  Critical alerts when you're at risk of failing or poor performance
                </p>
              </div>
              <Switch
                id="at-risk-alerts"
                checked={preferences.at_risk_alerts}
                onCheckedChange={(checked) => handleSwitchChange('at_risk_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="performance-alerts" className="text-sm font-medium">
                  Performance Alerts 📊
                </Label>
                <p className="text-xs text-gray-500">
                  Notifications about quiz, assignment, and exam performance
                </p>
              </div>
              <Switch
                id="performance-alerts"
                checked={preferences.performance_alerts}
                onCheckedChange={(checked) => handleSwitchChange('performance_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="attendance-alerts" className="text-sm font-medium">
                  Attendance Alerts 📅
                </Label>
                <p className="text-xs text-gray-500">
                  Warnings about low attendance and attendance milestones
                </p>
              </div>
              <Switch
                id="attendance-alerts"
                checked={preferences.attendance_alerts}
                onCheckedChange={(checked) => handleSwitchChange('attendance_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="grade-prediction-alerts" className="text-sm font-medium">
                  Grade Prediction Alerts 🎯
                </Label>
                <p className="text-xs text-gray-500">
                  Updates about your predicted grades and final marks
                </p>
              </div>
              <Switch
                id="grade-prediction-alerts"
                checked={preferences.grade_prediction_alerts}
                onCheckedChange={(checked) => handleSwitchChange('grade_prediction_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="motivational-alerts" className="text-sm font-medium">
                  Motivational Alerts 💪
                </Label>
                <p className="text-xs text-gray-500">
                  Encouraging messages and achievement celebrations
                </p>
              </div>
              <Switch
                id="motivational-alerts"
                checked={preferences.motivational_alerts}
                onCheckedChange={(checked) => handleSwitchChange('motivational_alerts', checked)}
              />
            </div>
          </div>
        </div>

        <hr />

        {/* Alert Frequency */}
        <div>
          <h3 className="text-lg font-medium mb-4">Alert Frequency</h3>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">How often would you like to receive alerts?</Label>
            <select
              value={preferences.alert_frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="immediate">Immediate - As soon as they're generated</option>
              <option value="daily">Daily - Once per day summary</option>
              <option value="weekly">Weekly - Weekly summary</option>
            </select>
            <p className="text-xs text-gray-500">
              Critical alerts will always be sent immediately regardless of this setting
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {message && (
              <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
          
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertPreferences;
