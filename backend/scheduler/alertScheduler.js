const cron = require('node-cron');
const alertService = require('../services/alertService');

// Schedule alert checks to run every day at 8 AM
const scheduleAlertChecks = () => {
  console.log('Setting up alert check scheduler...');
  
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled alert check...');
    try {
      const result = await alertService.checkAndCreateAlerts();
      console.log('Scheduled alert check completed:', result.message);
    } catch (error) {
      console.error('Scheduled alert check failed:', error);
    }
  });

  // Also run every 6 hours for more frequent monitoring
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running hourly alert check...');
    try {
      const result = await alertService.checkAndCreateAlerts();
      console.log('Hourly alert check completed:', result.message);
    } catch (error) {
      console.error('Hourly alert check failed:', error);
    }
  });

  console.log('Alert check scheduler initialized');
};

module.exports = { scheduleAlertChecks };
