import numpy as np
import pandas as pd
import joblib
import os
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from copy import deepcopy

# Configuration
SUBJECTS = {
    'Easy': 'subject_models/Easy_best_model.pkl',
    'Medium': 'subject_models/Medium_best_model.pkl',
    'Hard': 'subject_models/Hard_best_model.pkl'
}

MODEL_TYPES = {
    'early': ['quiz1', 'quiz2', 'Gender', 'Motivation_Level'],
    'mid': ['quiz1', 'quiz2', 'Midterm_Marks', 'Assignment1', 'Attendance'],
    'full': 'all'  # Uses all features
}


def load_and_enhance_model(model_path):
    """Load existing model and enhance it with missing-data handling"""
    print(f"\nLoading model from {model_path}...")
    try:
        old_model_data = joblib.load(model_path)
    except FileNotFoundError:
        print(f"Error: Model file not found at {model_path}")
        return None

    # Extract components
    model = old_model_data['model']
    label_encoders = old_model_data['label_encoders']
    feature_groups = old_model_data['feature_groups']

    # Get full feature list
    all_features = (
            feature_groups['high'] +
            feature_groups['medium'] +
            feature_groups['low']
    )

    # Create MICE imputer
    imputer = IterativeImputer(random_state=42, max_iter=10)

    return {
        'model': model,
        'imputer': imputer,
        'label_encoders': label_encoders,
        'all_features': all_features,
        'original_path': model_path
    }


def create_specialized_models(base_model_data, subject_name):
    """Create stage-specific models for a subject"""
    enhanced_models = {}

    for stage, features in MODEL_TYPES.items():
        print(f"\nCreating {stage} model for {subject_name}...")

        # Make a deep copy
        model_data = deepcopy(base_model_data)

        if features != 'all':
            model_data['expected_features'] = [
                f for f in features
                if f in model_data['all_features']
            ]
        else:
            model_data['expected_features'] = model_data['all_features']

        enhanced_models[stage] = model_data

    return enhanced_models


def save_enhanced_models(subject_name, models):
    """Save all enhanced models for a subject"""
    os.makedirs('enhanced_models', exist_ok=True)

    for stage, model_data in models.items():
        filename = f'enhanced_models/{subject_name}_{stage}_enhanced.pkl'
        joblib.dump(model_data, filename)
        print(f"Saved {filename}")


def process_all_subjects():
    """Process all three subjects"""
    for subject_name, model_path in SUBJECTS.items():
        print(f"\n{'=' * 40}")
        print(f"Processing {subject_name} subject")
        print(f"{'=' * 40}")

        # Load and enhance base model
        base_model = load_and_enhance_model(model_path)
        if not base_model:
            continue

        # Create specialized versions
        enhanced_models = create_specialized_models(base_model, subject_name)

        # Save all models
        save_enhanced_models(subject_name, enhanced_models)

    print("\nAll subjects processed successfully!")
    print(f"Enhanced models saved in 'enhanced_models' directory")


if __name__ == "__main__":
    process_all_subjects()