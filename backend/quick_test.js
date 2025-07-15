const db = require('./config/db');

async function quickTest() {
  console.log("🔍 Quick database connection test...");
  
  try {
    const [result] = await db.promise().query("SELECT 1 as test");
    console.log("✅ Database connected successfully");
    
    const [users] = await db.promise().query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    console.log(`📊 Found ${users[0].count} students in database`);
    
    const [marks] = await db.promise().query("SELECT COUNT(*) as count FROM lecturer_marks WHERE quiz1 IS NOT NULL");
    console.log(`📋 Found ${marks[0].count} students with quiz marks`);
    
  } catch (error) {
    console.error("❌ Database error:", error.message);
  } finally {
    console.log("🔚 Closing connection...");
    db.end();
    process.exit(0);
  }
}

quickTest();
