const db = require('./config/db');

async function clearAlertsDatabase() {
  try {
    console.log('🧹 Clearing alerts database...');
    
    // Clear alerts table
    await db.promise().query('DELETE FROM alerts');
    console.log('✅ Cleared alerts table');
    
    // Clear alert generation log
    await db.promise().query('DELETE FROM alert_generation_log');
    console.log('✅ Cleared alert_generation_log table');
    
    // Reset auto increment
    await db.promise().query('ALTER TABLE alerts AUTO_INCREMENT = 1');
    await db.promise().query('ALTER TABLE alert_generation_log AUTO_INCREMENT = 1');
    console.log('✅ Reset auto increment counters');
    
    console.log('🎉 Database cleared successfully! The alert system is now ready for real-time alerts only.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearAlertsDatabase();
