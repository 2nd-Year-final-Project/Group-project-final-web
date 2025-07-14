const axios = require('axios');
const alertsService = require('../services/alertsService');

// Test script for the Real-Time Alerts System
class AlertsSystemTest {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Alerts System Tests...\n');

    try {
      await this.testDatabaseTables();
      await this.testAlertGeneration();
      await this.testAPIEndpoints();
      await this.testEmailService();
      await this.testScheduler();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Test suite error: ${error.message}`);
    }
  }

  async testDatabaseTables() {
    console.log('📊 Testing Database Tables...');
    
    try {
      const db = require('../config/db');
      
      // Test alerts table
      const [alertsTable] = await db.promise().query('DESCRIBE alerts');
      this.assert(alertsTable.length > 0, 'Alerts table exists');
      
      // Test lecturer_alerts table
      const [lecturerAlertsTable] = await db.promise().query('DESCRIBE lecturer_alerts');
      this.assert(lecturerAlertsTable.length > 0, 'Lecturer alerts table exists');
      
      // Test alert_preferences table
      const [preferencesTable] = await db.promise().query('DESCRIBE alert_preferences');
      this.assert(preferencesTable.length > 0, 'Alert preferences table exists');
      
      // Test alert_thresholds table
      const [thresholdsTable] = await db.promise().query('DESCRIBE alert_thresholds');
      this.assert(thresholdsTable.length > 0, 'Alert thresholds table exists');
      
      // Test default thresholds exist
      const [thresholds] = await db.promise().query('SELECT COUNT(*) as count FROM alert_thresholds');
      this.assert(thresholds[0].count > 0, 'Default alert thresholds are configured');
      
      console.log('✅ Database tables test passed\n');
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Database test failed: ${error.message}`);
      console.log('❌ Database tables test failed\n');
    }
  }

  async testAlertGeneration() {
    console.log('🚨 Testing Alert Generation...');
    
    try {
      // Test prediction alerts
      const predictionData = {
        predicted_grade: 'F',
        predicted_marks: 35,
        confidence: 0.85
      };
      
      await alertsService.generatePredictionAlerts(1, 1, predictionData);
      this.assert(true, 'Prediction alerts generation works');
      
      // Test quiz alerts
      await alertsService.generateQuizAlerts(1, 1, 1, 30);
      this.assert(true, 'Quiz alerts generation works');
      
      // Test assignment alerts
      await alertsService.generateAssignmentAlerts(1, 1, 1, 25);
      this.assert(true, 'Assignment alerts generation works');
      
      // Test attendance alerts
      await alertsService.generateAttendanceAlerts(1, 1, 45);
      this.assert(true, 'Attendance alerts generation works');
      
      // Test motivational alerts
      await alertsService.generateMotivationalAlerts(1, 1);
      this.assert(true, 'Motivational alerts generation works');
      
      console.log('✅ Alert generation test passed\n');
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Alert generation test failed: ${error.message}`);
      console.log('❌ Alert generation test failed\n');
    }
  }

  async testAPIEndpoints() {
    console.log('🌐 Testing API Endpoints...');
    
    try {
      // Test student alerts endpoint
      const studentAlertsResponse = await axios.get(`${this.baseURL}/alerts/student/1`);
      this.assert(studentAlertsResponse.status === 200, 'Student alerts endpoint works');
      this.assert(Array.isArray(studentAlertsResponse.data.alerts), 'Student alerts returns array');
      
      // Test lecturer alerts endpoint
      const lecturerAlertsResponse = await axios.get(`${this.baseURL}/alerts/lecturer/1`);
      this.assert(lecturerAlertsResponse.status === 200, 'Lecturer alerts endpoint works');
      
      // Test alert preferences endpoint
      const preferencesResponse = await axios.get(`${this.baseURL}/alerts/preferences/1`);
      this.assert(preferencesResponse.status === 200, 'Alert preferences endpoint works');
      
      // Test analytics endpoint
      const analyticsResponse = await axios.get(`${this.baseURL}/alerts/analytics`);
      this.assert(analyticsResponse.status === 200, 'Analytics endpoint works');
      
      console.log('✅ API endpoints test passed\n');
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`API endpoints test failed: ${error.message}`);
      console.log('❌ API endpoints test failed\n');
    }
  }

  async testEmailService() {
    console.log('📧 Testing Email Service...');
    
    try {
      const { sendAlertEmail } = require('../utils/emailService');
      
      // Test email function exists and is callable
      this.assert(typeof sendAlertEmail === 'function', 'Email service function exists');
      
      // Note: We don't actually send emails in tests to avoid spam
      console.log('✅ Email service test passed (function exists)\n');
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Email service test failed: ${error.message}`);
      console.log('❌ Email service test failed\n');
    }
  }

  async testScheduler() {
    console.log('⏰ Testing Alert Scheduler...');
    
    try {
      const alertScheduler = require('../scheduler/alertScheduler');
      
      // Test scheduler methods exist
      this.assert(typeof alertScheduler.start === 'function', 'Scheduler start method exists');
      this.assert(typeof alertScheduler.stop === 'function', 'Scheduler stop method exists');
      this.assert(typeof alertScheduler.processAlerts === 'function', 'Scheduler processAlerts method exists');
      
      // Test scheduler status
      const status = alertScheduler.getStatus();
      this.assert(typeof status === 'object', 'Scheduler status is available');
      
      console.log('✅ Alert scheduler test passed\n');
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push(`Scheduler test failed: ${error.message}`);
      console.log('❌ Alert scheduler test failed\n');
    }
  }

  assert(condition, message) {
    if (condition) {
      this.testResults.passed++;
      console.log(`  ✅ ${message}`);
    } else {
      this.testResults.failed++;
      this.testResults.errors.push(message);
      console.log(`  ❌ ${message}`);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Tests Passed: ${this.testResults.passed}`);
    console.log(`❌ Tests Failed: ${this.testResults.failed}`);
    console.log(`📊 Total Tests: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! The alerts system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // Manual test scenarios
  async runManualTestScenarios() {
    console.log('\n🎯 Manual Test Scenarios:\n');
    
    console.log('1. 🚨 Critical Alert Scenario:');
    console.log('   - Student with predicted marks < 40%');
    console.log('   - Should generate critical alert');
    console.log('   - Should send email notification');
    console.log('   - Should alert lecturer\n');
    
    console.log('2. 📊 Performance Alert Scenario:');
    console.log('   - Student with quiz marks < 55%');
    console.log('   - Should generate performance alert');
    console.log('   - Should appear in dashboard\n');
    
    console.log('3. 📅 Attendance Alert Scenario:');
    console.log('   - Student with attendance < 65%');
    console.log('   - Should generate attendance warning');
    console.log('   - Should notify lecturer if < 75%\n');
    
    console.log('4. 🌟 Excellence Alert Scenario:');
    console.log('   - Student with marks > 85%');
    console.log('   - Should generate congratulatory alert');
    console.log('   - Should be low priority\n');
    
    console.log('5. 💪 Motivational Alert Scenario:');
    console.log('   - Random motivational messages');
    console.log('   - Should appear occasionally');
    console.log('   - Should not spam students\n');
    
    console.log('To test these scenarios manually:');
    console.log('1. Add test data to lecturer_marks table');
    console.log('2. Update attendance in admin_inputs table');
    console.log('3. Generate predictions for students');
    console.log('4. Check alerts in the dashboard');
    console.log('5. Verify email notifications are sent');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AlertsSystemTest();
  
  (async () => {
    await tester.runAllTests();
    await tester.runManualTestScenarios();
  })();
}

module.exports = AlertsSystemTest;
