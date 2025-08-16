const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Run database migrations for alert system
const runAlertMigrations = async () => {
  try {
    console.log("📧 Starting alert system database migrations...");
    
    const alertSchemaPath = path.join(__dirname, "../database/alerts_schema.sql");
    const alertSchema = fs.readFileSync(alertSchemaPath, "utf8");
    
    // Split and execute each SQL statement
    const statements = alertSchema
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes("create table")) {
        try {
          await db.promise().query(statement);
          console.log("✅ Table created successfully");
        } catch (error) {
          if (error.message.includes("already exists")) {
            console.log("⚠️ Table already exists, skipping...");
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log("🎉 Alert system database migrations completed successfully!");
    
  } catch (error) {
    console.error("❌ Error running alert migrations:", error);
    throw error;
  }
};

// Check if alerts table exists
const checkAlertTables = async () => {
  try {
    const [tables] = await db.promise().query("SHOW TABLES LIKE 'alerts'");
    if (tables.length === 0) {
      console.log("🔍 Alert tables not found, running migrations...");
      await runAlertMigrations();
    } else {
      console.log("✅ Alert tables already exist");
    }
  } catch (error) {
    console.error("❌ Error checking alert tables:", error);
  }
};

module.exports = {
  runAlertMigrations,
  checkAlertTables
};
