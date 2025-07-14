const db = require("./config/db");

// Test database connection and check if courses table exists
console.log("Testing database connection...");

// Check if courses table exists
db.query("SHOW TABLES LIKE 'courses'", (err, results) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  
  if (results.length === 0) {
    console.log("❌ COURSES TABLE DOES NOT EXIST!");
    console.log("Please run the course_management_updates.sql script first:");
    console.log("mysql -u [username] -p [database_name] < database/course_management_updates.sql");
  } else {
    console.log("✅ Courses table exists");
    
    // Check table structure
    db.query("DESCRIBE courses", (err, results) => {
      if (err) {
        console.error("Error describing table:", err);
        return;
      }
      
      console.log("📋 Courses table structure:");
      console.table(results);
      
      // Test adding a sample course
      const testCourse = {
        course_code: 'TEST101',
        course_name: 'Test Course',
        description: 'A test course for debugging',
        credits: 3,
        difficulty_level: 'Easy'
      };
      
      const sql = `
        INSERT INTO courses (course_code, course_name, description, credits, difficulty_level)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(sql, [testCourse.course_code, testCourse.course_name, testCourse.description, testCourse.credits, testCourse.difficulty_level], (err, result) => {
        if (err) {
          console.error("❌ Error inserting test course:", err.message);
        } else {
          console.log("✅ Test course added successfully with ID:", result.insertId);
          
          // Clean up - delete the test course
          db.query("DELETE FROM courses WHERE id = ?", [result.insertId], (deleteErr) => {
            if (deleteErr) {
              console.error("Error cleaning up test course:", deleteErr);
            } else {
              console.log("🧹 Test course cleaned up");
            }
            process.exit(0);
          });
        }
      });
    });
  }
});

// Also check if admin routes are properly configured
console.log("Checking if course routes are accessible...");
console.log("Course routes should be available at: /api/admin/courses");
