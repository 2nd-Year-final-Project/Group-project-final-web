from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import warnings
import os

app = Flask(__name__)

LOADED_MODELS = {}

SUBJECTS = ['Easy', 'Medium', 'Hard']
STAGES = ['early', 'mid', 'full']

# Feature sets for each stage
STAGE_FEATURES = {
    'early': ['quiz1', 'quiz2', 'Gender', 'Motivation_Level'],
    'mid': ['quiz1', 'quiz2', 'Midterm_Marks', 'Assignment1', 'Attendance'],
    'full': [
        'quiz1', 'quiz2', 'Midterm_Marks', 'Assignment1', 'Assignment2',
        'Hours_Studied', 'Attendance', 'Sleep_Hours', 'Gender',
        'Peer_Influence', 'Motivation_Level', 'Teacher_Quality',
        'Extracurricular_Activities', 'Physical_Activity'
    ]
}

# Snake_case → Model-case mapping
CASE_MAP = {
    'gender': 'Gender',
    'peer_influence': 'Peer_Influence',
    'motivation_level': 'Motivation_Level',
    'extracurricular_activities': 'Extracurricular_Activities',
    'physical_activity': 'Physical_Activity',
    'sleep_hours': 'Sleep_Hours',
    'hours_studied': 'Hours_Studied',
    'teacher_quality': 'Teacher_Quality',
    'quiz1': 'quiz1',
    'quiz2': 'quiz2',
    'assignment1': 'Assignment1',
    'assignment2': 'Assignment2',
    'midterm_marks': 'Midterm_Marks',
    'attendance': 'Attendance',
    'subject': 'subject',
    'stage': 'stage'
}


def determine_stage(input_keys):
    input_set = set(input_keys)

    # Full stage if all features are present
    full_required_features = set(STAGE_FEATURES['full'])
    if full_required_features.issubset(input_set):
        return 'full'

    # Otherwise choose best match between early/mid
    scores = {}
    for stage in ['early', 'mid']:
        features = set(STAGE_FEATURES[stage])
        match_count = len(features.intersection(input_set))
        scores[stage] = match_count

    best_stage = max(scores, key=scores.get)

    # Fallback to full if not enough info
    if scores[best_stage] < 2:
        return 'full'

    return best_stage


def load_model(subject, stage):
    key = f"{subject}_{stage}"
    if key in LOADED_MODELS:
        return LOADED_MODELS[key]

    model_path = f"enhanced_models/{key}_enhanced.pkl"
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model_data = joblib.load(model_path)

    expected_features = model_data['expected_features']
    all_features = model_data['all_features']

    LOADED_MODELS[key] = {
        'model_data': model_data,
        'expected_features': expected_features,
        'all_features': all_features
    }
    return LOADED_MODELS[key]


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("✅ Received features:", list(data.keys()))

        # Convert keys to match model format (CamelCase)
        converted_data = {}
        for k, v in data.items():
            key_mapped = CASE_MAP.get(k, k)
            converted_data[key_mapped] = v

        subject = converted_data.get('subject')
        if subject not in SUBJECTS:
            return jsonify({'error': f"Invalid subject. Choose from {SUBJECTS}"}), 400

        # Determine stage
        stage = converted_data.get('stage')
        if not stage:
            user_features = [k for k in converted_data.keys() if k not in ['subject', 'stage']]
            stage = determine_stage(user_features)

        if stage not in STAGES:
            return jsonify({'error': f"Invalid stage. Choose from {STAGES}"}), 400

        # Load model
        model_info = load_model(subject, stage)
        model_data = model_info['model_data']
        expected = model_info['expected_features']
        all_features = model_info['all_features']

        # Prepare input vector
        input_vec = np.full(len(expected), np.nan)
        for i, feature in enumerate(expected):
            if feature in converted_data:
                try:
                    input_vec[i] = float(converted_data[feature])
                except ValueError:
                    return jsonify({'error': f"Invalid value for {feature}"}), 400

        # Build full input DataFrame
        full_input = pd.DataFrame([np.nan] * len(all_features), index=all_features).T
        for i, feature in enumerate(expected):
            full_input.at[0, feature] = input_vec[i]

        prediction = model_data['model'].predict(full_input)[0]
        prediction = float(round(prediction, 2))

        # Interpretation
        if prediction >= 85:
            interpretation = "Excellent"
        elif prediction >= 70:
            interpretation = "Good"
        elif prediction >= 50:
            interpretation = "Average"
        else:
            interpretation = "Needs improvement"

        return jsonify({
            'subject': subject,
            'stage_used': stage,
            'model_file_used': f"{subject}_{stage}_enhanced.pkl",
            'predicted_grade': f"{prediction:.2f}",
            'interpretation': interpretation
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5002)
