from flask import Blueprint, request, jsonify
from ..utils.model_loader import ModelLoader
from ..utils.db import get_db_connection
from ..utils.feature_engineering import prepare_features

bp = Blueprint('prediction', __name__)
model_loader = ModelLoader.get_instance()

@bp.route('/predict', methods=['POST'])
def predict():
    data = request.json
    enrollment_id = data['enrollment_id']
    
    try:
        # 1. Fetch student data
        student_data = get_student_data(enrollment_id)
        
        # 2. Detect missing fields
        missing_fields = [
            field for field in ['assignment2', 'midterm'] 
            if student_data.get(field) is None
        ]
        
        # 3. Select appropriate model
        model = model_loader.get_model(
            student_data['subject_code'],
            missing_fields
        )
        
        # 4. Prepare features
        features = prepare_features(student_data, missing_fields)
        
        # 5. Make prediction
        prediction = model.predict([features])[0]
        
        return jsonify({
            "predicted_grade": float(prediction),
            "model_used": "null_quiz1" if 'assignment2' in missing_fields else 
                         "null_midterm" if 'midterm' in missing_fields else "full",
            "confidence": calculate_confidence(prediction, missing_fields)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_confidence(prediction, missing_fields):
    """Lower confidence when using null-handling models"""
    base_confidence = 0.9
    penalty = 0.15 * len(missing_fields)
    return max(0.5, base_confidence - penalty)