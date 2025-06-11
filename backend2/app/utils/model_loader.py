import joblib
import os
from flask import current_app

class ModelLoader:
    _instance = None
    
    def __init__(self):
        self.models = {
            'WEB101': self._load_web_dev_models(),
            'MATH201': self._load_math_models(),
            'DATA301': self._load_data_struct_models()
        }
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def _load_web_dev_models(self):
        return {
            'full': self._load_model('web_dev/Easy_full_enhanced.pkl'),
            'null_quiz1': self._load_model('web_dev/Easy_mid_enhanced.pkl'),
            'null_midterm': self._load_model('web_dev/Easy_early_enhanced.pkl')
        }
    
    def _load_math_models(self):
        return {
            'full': self._load_model('math/Medium_full_enhanced.pkl'),
            'null_quiz1': self._load_model('math/Medium_mid_enhanced.pkl'),
            'null_midterm': self._load_model('math/Medium_early_enhanced.pkl')
        }
    
    def _load_data_struct_models(self):
        return {
            'full': self._load_model('data_structures/Hard_full_enhanced.pkl'),
            'null_quiz1': self._load_model('data_structures/Hard_mid_enhanced.pkl'),
            'null_midterm': self._load_model('data_structures/Hard_early_enhanced.pkl')
        }
    
    def _load_model(self, path):
        full_path = os.path.join(current_app.config['MODEL_PATH'], path)
        return joblib.load(full_path)
    
    def get_model(self, subject_code, missing_fields=None):
        subject_models = self.models.get(subject_code)
        if not subject_models:
            raise ValueError(f"No models for subject {subject_code}")
        
        if not missing_fields:
            return subject_models['full']
        
        if 'quiz1' in missing_fields:
            return subject_models['null_quiz1']
        elif 'midterm' in missing_fields:
            return subject_models['null_midterm']
        
        return subject_models['full']