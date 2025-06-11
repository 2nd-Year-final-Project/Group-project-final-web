import numpy as np

def prepare_features(student_data, missing_fields):
    """Handle null values differently per model type"""
    features = {
        'quiz_avg': calculate_quiz_avg(student_data, missing_fields),
        'assignment_avg': (student_data.get('assignment1', 0) + 
                          student_data.get('assignment2', 0)) / 2,
        'midterm': handle_missing(student_data.get('midterm'), 'midterm', missing_fields),
        'study_hours': student_data['study_hours'],
        'sleep_hours': student_data['sleep_hours'],
        'teacher_quality': {'poor': 0, 'average': 1, 'good': 2, 'excellent': 3}[
            student_data['teacher_quality']
        ],
        'attendance': student_data['attendance'] / 100,
        'motivation': {'low': 0, 'medium': 1, 'high': 2}[student_data['motivation']]
    }
    
    # Special imputation for null-handling models
    if 'quiz1' in missing_fields:
        features['quiz_imputed'] = 1  # Flag for the model
    if 'midterm' in missing_fields:
        features['midterm_imputed'] = 1
        
    return features

def calculate_quiz_avg(data, missing_fields):
    if 'quiz1' in missing_fields:
        return data.get('quiz2', 0)  # When quiz1 missing, use only quiz2
    elif 'quiz2' in missing_fields:
        return data.get('quiz1', 0)  # When quiz2 missing, use only quiz1
    return (data.get('quiz1', 0) + data.get('quiz2', 0)) / 2

def handle_missing(value, field_name, missing_fields):
    """Special handling based on which model is being used"""
    if field_name in missing_fields:
        # Return subject average when using null-handling models
        return {
            'WEB101': 65,
            'MATH201': 60,
            'DATA301': 55
        }.get(missing_fields[0], 60)
    return value