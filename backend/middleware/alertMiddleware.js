const alertScheduler = require("../scheduler/alertScheduler");

// Middleware to trigger alerts when marks are updated
const triggerMarksAlerts = (assessmentType) => {
  return async (req, res, next) => {
    // Store original res.json function
    const originalJson = res.json;
    
    // Override res.json to capture successful responses
    res.json = function(data) {
      // Check if the response indicates success
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract student_id and course_id from request
        const { student_id, course_id } = req.body || req.params;
        const marks = req.body[assessmentType] || req.body.marks;
        
        if (student_id && course_id && marks !== undefined && marks !== null) {
          // Trigger alert processing asynchronously
          setImmediate(async () => {
            try {
              await alertScheduler.processTriggeredAlerts('marks_updated', {
                student_id: parseInt(student_id),
                course_id: parseInt(course_id),
                assessment_type: assessmentType,
                marks: parseFloat(marks)
              });
            } catch (error) {
              console.error(`Error triggering alerts for ${assessmentType}:`, error);
            }
          });
        }
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Middleware to trigger alerts when attendance is updated
const triggerAttendanceAlerts = async (req, res, next) => {
  // Store original res.json function
  const originalJson = res.json;
  
  // Override res.json to capture successful responses
  res.json = function(data) {
    // Check if the response indicates success
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Extract student_id, course_id, and attendance from request
      const { student_id, course_id, attendance } = req.body || req.params;
      
      if (student_id && course_id && attendance !== undefined && attendance !== null) {
        // Trigger alert processing asynchronously
        setImmediate(async () => {
          try {
            await alertScheduler.processTriggeredAlerts('attendance_updated', {
              student_id: parseInt(student_id),
              course_id: parseInt(course_id),
              attendance: parseFloat(attendance)
            });
          } catch (error) {
            console.error('Error triggering attendance alerts:', error);
          }
        });
      }
    }
    
    // Call original res.json
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware to trigger alerts when predictions are generated
const triggerPredictionAlerts = async (req, res, next) => {
  // Store original res.json function
  const originalJson = res.json;
  
  // Override res.json to capture successful responses
  res.json = function(data) {
    // Check if the response indicates success and contains prediction data
    if (res.statusCode >= 200 && res.statusCode < 300 && data.predicted_grade) {
      // Extract student_id and course_id from request params
      const { student_id, course_id } = req.params;
      
      if (student_id && course_id) {
        // Trigger alert processing asynchronously
        setImmediate(async () => {
          try {
            await alertScheduler.processTriggeredAlerts('prediction_generated', {
              student_id: parseInt(student_id),
              course_id: parseInt(course_id),
              prediction: data
            });
          } catch (error) {
            console.error('Error triggering prediction alerts:', error);
          }
        });
      }
    }
    
    // Call original res.json
    return originalJson.call(this, data);
  };
  
  next();
};

// Factory function to create assessment-specific middleware
const createAssessmentAlertMiddleware = (assessmentType) => {
  return triggerMarksAlerts(assessmentType);
};

module.exports = {
  triggerMarksAlerts,
  triggerAttendanceAlerts,
  triggerPredictionAlerts,
  createAssessmentAlertMiddleware,
  
  // Pre-configured middlewares for different assessment types
  triggerQuizAlerts: createAssessmentAlertMiddleware('quiz'),
  triggerAssignmentAlerts: createAssessmentAlertMiddleware('assignment'),
  triggerMidtermAlerts: createAssessmentAlertMiddleware('midterm_marks')
};
