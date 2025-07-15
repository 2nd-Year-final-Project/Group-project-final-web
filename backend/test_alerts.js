const AlertService = require("./services/alertService");
const { checkAlertTables } = require("./utils/alertMigrations");

// Test alert generation
const testAlertGeneration = async () => {
  try {
    console.log("🧪 Starting alert system tests...");
    
    // Ensure alert tables exist
    await checkAlertTables();
    
    // Test different performance scenarios
    const testCases = [
      { studentId: 1, courseId: 1, percentage: 95, description: "Excellent performance" },
      { studentId: 2, courseId: 1, percentage: 75, description: "Good performance" },
      { studentId: 3, courseId: 2, percentage: 62, description: "Satisfactory performance" },
      { studentId: 4, courseId: 2, percentage: 45, description: "Poor performance" },
      { studentId: 5, courseId: 3, percentage: 30, description: "Critical performance" },
    ];
    
    console.log("📊 Generating test alerts for different performance levels...");
    
    for (const testCase of testCases) {
      try {
        console.log(`\n🎯 Testing ${testCase.description} (${testCase.percentage}%)`);
        
        const alerts = await AlertService.generateAlertsFromPrediction(
          testCase.studentId, 
          testCase.courseId, 
          testCase.percentage
        );
        
        console.log(`✅ Generated ${alerts.length} alerts:`);
        alerts.forEach(alert => {
          console.log(`   📧 ${alert.recipient}: ${alert.title} (${alert.severity})`);
        });
        
      } catch (error) {
        console.log(`❌ Failed to generate alerts for test case: ${error.message}`);
      }
    }
    
    console.log("\n🎉 Alert generation tests completed!");
    
  } catch (error) {
    console.error("❌ Error in alert generation tests:", error);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAlertGeneration()
    .then(() => {
      console.log("✅ All tests completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Tests failed:", error);
      process.exit(1);
    });
}

module.exports = { testAlertGeneration };
