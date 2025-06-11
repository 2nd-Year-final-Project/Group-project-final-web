const axios = require('axios');

async function predictGrade(enrollmentId) {
  try {
    const response = await axios.post(`${process.env.FLASK_API_URL}/predict`, {
      enrollment_id: enrollmentId
    });
    
    return {
      grade: response.data.predicted_grade,
      confidence: response.data.confidence,
      modelUsed: response.data.model_used
    };
  } catch (error) {
    console.error('Prediction failed:', error);
    return null;
  }
}

async function updatePredictions(enrollmentId) {
  const prediction = await predictGrade(enrollmentId);
  
  if (prediction) {
    // Save to database
    await db.query(`
      INSERT INTO grade_predictions 
      (enrollment_id, predicted_grade, confidence_score, model_used)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        predicted_grade = VALUES(predicted_grade),
        confidence_score = VALUES(confidence_score),
        model_used = VALUES(model_used)
    `, [enrollmentId, prediction.grade, prediction.confidence, prediction.modelUsed]);
    
    return prediction;
  }
  
  return null;
}

module.exports = { updatePredictions };