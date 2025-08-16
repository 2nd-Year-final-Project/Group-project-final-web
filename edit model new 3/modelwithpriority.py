import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from time import time
from scipy.stats import randint, uniform

# Import all 8 algorithms
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor
from xgboost import XGBRegressor

# Create directories if they don't exist
os.makedirs('subject_models', exist_ok=True)
os.makedirs('performance_charts', exist_ok=True)
os.makedirs('hyperparameters', exist_ok=True)

# Define hyperparameter grids for each algorithm
hyperparameters = {
    'Linear Regression': {
        'fit_intercept': [True, False],
        'positive': [True, False]
    },
    'Decision Tree': {
        'max_depth': [None, 5, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    },
    'Random Forest': {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    },
    'Gradient Boosting': {
        'n_estimators': [100, 200],
        'learning_rate': [0.01, 0.1, 0.2],
        'max_depth': [3, 5, 7]
    },
   # 'Support Vector Machine': {
    #    'C': [0.1, 1, 10, 100],
     #   'kernel': ['linear', 'rbf'],
     #   'gamma': ['scale', 'auto']
    #},
    'K-Neighbors': {
        'n_neighbors': [3, 5, 7, 9],
        'weights': ['uniform', 'distance'],
        'p': [1, 2]
    },
    'Neural Network': {
        'hidden_layer_sizes': [(50,), (100,), (50, 50), (100, 50)],
        'activation': ['relu', 'tanh'],
        'alpha': [0.0001, 0.001, 0.01]
    },
    'XGBoost': {
        'n_estimators': [100, 200],
        'max_depth': [3, 6, 9],
        'learning_rate': [0.01, 0.1, 0.2],
        'subsample': [0.8, 1.0],
        'colsample_bytree': [0.8, 1.0]
    }
}

# Define base models
base_models = {
    'Linear Regression': LinearRegression(),
    'Decision Tree': DecisionTreeRegressor(random_state=42),
    'Random Forest': RandomForestRegressor(random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(random_state=42),
    #'Support Vector Machine': SVR(),
    'K-Neighbors': KNeighborsRegressor(),
    'Neural Network': MLPRegressor(max_iter=1000, random_state=42),
    'XGBoost': XGBRegressor(random_state=42)
}


def preprocess_data(df):
    """Preprocess the data with feature prioritization"""
    high_priority = ['Midterm_Marks', 'quiz1', 'quiz2']
    medium_priority = ['Assignment1', 'Assignment2', 'Hours_Studied']
    low_priority = [
        'Attendance', 'Sleep_Hours', 'Gender',
        'Peer_Influence', 'Motivation_Level',
        'Teacher_Quality', 'Extracurricular_Activities',
        'Physical_Activity'
    ]

    selected_features = high_priority + medium_priority + low_priority + ['Final_Marks']
    df = df[selected_features]

    categorical_cols = ['Gender', 'Peer_Influence', 'Motivation_Level',
                        'Teacher_Quality', 'Extracurricular_Activities']

    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    return df, label_encoders, high_priority, medium_priority, low_priority


def tune_and_evaluate_models(X_train, X_test, y_train, y_test, feature_groups):
    """Tune hyperparameters and evaluate all 8 algorithms"""
    results = []
    best_params = {}

    # Create feature group subsets
    X_train_high = X_train[feature_groups['high']]
    X_train_medium = X_train[feature_groups['high'] + feature_groups['medium']]
    X_train_all = X_train

    X_test_high = X_test[feature_groups['high']]
    X_test_medium = X_test[feature_groups['high'] + feature_groups['medium']]
    X_test_all = X_test

    for name, model in base_models.items():
        try:
            start_time = time()

            print(f"\nTuning {name}...")

            if name == 'Linear Regression':
                model.fit(X_train_all, y_train)
                best_params[name] = model.get_params()
            else:
                search = RandomizedSearchCV(
                    model,
                    hyperparameters[name],
                    n_iter=10,
                    cv=5,
                    scoring='r2',
                    n_jobs=-1,
                    random_state=42
                )
                search.fit(X_train_all, y_train)
                best_model = search.best_estimator_
                best_params[name] = search.best_params_

            # Evaluate on all features
            if name == 'Linear Regression':
                model.fit(X_train_all, y_train)
                y_pred = model.predict(X_test_all)
            else:
                best_model.fit(X_train_all, y_train)
                y_pred = best_model.predict(X_test_all)

            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            accuracy = r2 * 100  # Convert R2 score to percentage

            training_time = time() - start_time

            results.append({
                'Algorithm': name,
                'Accuracy (%)': accuracy,
                'R2_Score': r2,
                'MSE': mse,
                'Training Time (s)': training_time,
                'Best_Params': best_params[name]
            })

            print(f"Completed {name} in {training_time:.2f} seconds (Accuracy: {accuracy:.2f}%)")

        except Exception as e:
            print(f"Error tuning {name}: {str(e)}")
            continue

    return pd.DataFrame(results), best_params


def train_and_evaluate_subject(df, subject_name):
    """Train and evaluate all models for one subject with hyperparameter tuning"""
    print(f"\n=== Training models for {subject_name} with hyperparameter tuning ===")

    # Preprocess data
    df_processed, label_encoders, high_priority, medium_priority, low_priority = preprocess_data(df)

    # Split data
    X = df_processed.drop('Final_Marks', axis=1)
    y = df_processed['Final_Marks']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Feature groups
    feature_groups = {
        'high': high_priority,
        'medium': medium_priority,
        'low': low_priority
    }

    # Tune and evaluate models
    results_df, best_params = tune_and_evaluate_models(X_train, X_test, y_train, y_test, feature_groups)

    # Save results and best parameters
    results_df.to_csv(f'performance_charts/{subject_name}_performance.csv', index=False)
    pd.DataFrame.from_dict(best_params, orient='index').to_csv(f'hyperparameters/{subject_name}_best_params.csv')

    # Plot performance comparison with accuracy percentages
    plt.figure(figsize=(14, 8))
    ax = sns.barplot(x='Algorithm', y='Accuracy (%)',
                     data=results_df.sort_values('Accuracy (%)', ascending=False))
    plt.title(f'Model Accuracy Comparison for {subject_name}')
    plt.xticks(rotation=45, ha='right')
    plt.ylim(0, 100)

    # Add accuracy labels on top of bars
    for p in ax.patches:
        ax.annotate(f'{p.get_height():.1f}%',
                    (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center',
                    xytext=(0, 10),
                    textcoords='offset points')

    plt.tight_layout()
    plt.savefig(f'performance_charts/{subject_name}_accuracy_comparison.png')
    plt.close()

    # Save the best model
    if not results_df.empty:
        best_model_idx = results_df['Accuracy (%)'].idxmax()
        best_model_name = results_df.loc[best_model_idx, 'Algorithm']
        best_accuracy = results_df.loc[best_model_idx, 'Accuracy (%)']

        if best_model_name == 'Linear Regression':
            best_model = base_models[best_model_name]
        else:
            best_model = base_models[best_model_name].set_params(**best_params[best_model_name])

        best_model.fit(X_train, y_train)

        model_data = {
            'model': best_model,
            'label_encoders': label_encoders,
            'feature_groups': feature_groups,
            'performance': results_df,
            'best_params': best_params.get(best_model_name, {})
        }

        joblib.dump(model_data, f'subject_models/{subject_name}_best_model.pkl')
        print(f"\nSaved best model for {subject_name}: {best_model_name} (Accuracy: {best_accuracy:.2f}%)")

    return results_df


def main():
    # Load datasets
    try:
        print("Loading datasets...")
        easy_df = pd.read_csv("Easy-final-dataset.csv")
        medium_df = pd.read_csv("Medium-final-dataset.csv")
        hard_df = pd.read_csv("Hard-final-dataset.csv")
        print("Datasets loaded successfully!")
    except FileNotFoundError as e:
        print(f"\nError loading dataset files: {e}")
        print("Please ensure these files are in the same directory:")
        print("- Easy-final-dataset.csv")
        print("- Medium-final-dataset.csv")
        print("- Hard-final-dataset.csv")
        return

    subjects = {
        'Easy': easy_df,
        'Medium': medium_df,
        'Hard': hard_df
    }

    all_results = {}

    for subject_name, df in subjects.items():
        try:
            print(f"\nProcessing {subject_name} dataset...")
            results = train_and_evaluate_subject(df, subject_name)
            all_results[subject_name] = results

            if not results.empty:
                print(f"\nTop 3 models for {subject_name}:")
                print(
                    results.sort_values('Accuracy (%)', ascending=False).head(3)[['Algorithm', 'Accuracy (%)', 'MSE']])

        except Exception as e:
            print(f"\nError processing {subject_name} dataset: {str(e)}")

    # Create combined comparison chart
    if all_results and any(not df.empty for df in all_results.values()):
        combined_results = pd.concat([df.assign(Subject=subject)
                                      for subject, df in all_results.items() if not df.empty])

        plt.figure(figsize=(14, 8))
        ax = sns.barplot(x='Algorithm', y='Accuracy (%)', hue='Subject',
                         data=combined_results.sort_values('Accuracy (%)', ascending=False))
        plt.title('Model Accuracy Comparison Across All Subjects')
        plt.xticks(rotation=45, ha='right')
        plt.ylim(0, 100)
        plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

        # Add accuracy labels
        for p in ax.patches:
            ax.annotate(f'{p.get_height():.1f}%',
                        (p.get_x() + p.get_width() / 2., p.get_height()),
                        ha='center', va='center',
                        xytext=(0, 10),
                        textcoords='offset points')

        plt.tight_layout()
        plt.savefig('performance_charts/combined_accuracy_comparison.png')
        plt.close()

    print("\nTraining complete! All models, parameters, and charts saved.")


if __name__ == "__main__":
    main()