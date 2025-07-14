-- Add alert-related tables to the existing database

-- Alerts table to store all alert information
CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `alert_type` enum('at_risk', 'excellent', 'good', 'average', 'poor_quiz', 'poor_assignment', 'poor_midterm', 'low_attendance', 'motivational') NOT NULL,
  `severity` enum('low', 'medium', 'high', 'critical') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `predicted_grade` varchar(10) DEFAULT NULL,
  `predicted_marks` decimal(5,2) DEFAULT NULL,
  `is_read` boolean DEFAULT FALSE,
  `is_resolved` boolean DEFAULT FALSE,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_course` (`student_id`, `course_id`),
  INDEX `idx_alert_type` (`alert_type`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Lecturer alerts table for notifying lecturers about their students
CREATE TABLE `lecturer_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lecturer_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `alert_type` enum('student_at_risk', 'student_improvement_needed', 'student_excelling', 'low_class_attendance', 'poor_assignment_performance') NOT NULL,
  `severity` enum('low', 'medium', 'high', 'critical') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `predicted_grade` varchar(10) DEFAULT NULL,
  `predicted_marks` decimal(5,2) DEFAULT NULL,
  `is_read` boolean DEFAULT FALSE,
  `is_resolved` boolean DEFAULT FALSE,
  `action_required` boolean DEFAULT FALSE,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`lecturer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_lecturer_course` (`lecturer_id`, `course_id`),
  INDEX `idx_alert_type` (`alert_type`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Alert preferences table for users to customize their alert settings
CREATE TABLE `alert_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_notifications` boolean DEFAULT TRUE,
  `push_notifications` boolean DEFAULT TRUE,
  `at_risk_alerts` boolean DEFAULT TRUE,
  `performance_alerts` boolean DEFAULT TRUE,
  `attendance_alerts` boolean DEFAULT TRUE,
  `grade_prediction_alerts` boolean DEFAULT TRUE,
  `motivational_alerts` boolean DEFAULT TRUE,
  `alert_frequency` enum('immediate', 'daily', 'weekly') DEFAULT 'immediate',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_preferences` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Alert thresholds table for configuring when alerts should be triggered
CREATE TABLE `alert_thresholds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `threshold_type` enum('attendance', 'quiz_marks', 'assignment_marks', 'midterm_marks', 'predicted_marks') NOT NULL,
  `severity` enum('low', 'medium', 'high', 'critical') NOT NULL,
  `min_value` decimal(5,2) DEFAULT NULL,
  `max_value` decimal(5,2) DEFAULT NULL,
  `description` text,
  `is_active` boolean DEFAULT TRUE,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_threshold_type` (`threshold_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default alert thresholds
INSERT INTO `alert_thresholds` (`threshold_type`, `severity`, `min_value`, `max_value`, `description`) VALUES
-- Attendance thresholds
('attendance', 'critical', 0.00, 50.00, 'Critical attendance warning - below 50%'),
('attendance', 'high', 50.01, 65.00, 'High attention needed - attendance 50-65%'),
('attendance', 'medium', 65.01, 75.00, 'Medium concern - attendance 65-75%'),
('attendance', 'low', 75.01, 85.00, 'Low concern - attendance 75-85%'),

-- Quiz marks thresholds
('quiz_marks', 'critical', 0.00, 40.00, 'Critical quiz performance - below 40%'),
('quiz_marks', 'high', 40.01, 55.00, 'Poor quiz performance - 40-55%'),
('quiz_marks', 'medium', 55.01, 70.00, 'Average quiz performance - 55-70%'),
('quiz_marks', 'low', 70.01, 100.00, 'Good quiz performance - above 70%'),

-- Assignment marks thresholds
('assignment_marks', 'critical', 0.00, 40.00, 'Critical assignment performance - below 40%'),
('assignment_marks', 'high', 40.01, 55.00, 'Poor assignment performance - 40-55%'),
('assignment_marks', 'medium', 55.01, 70.00, 'Average assignment performance - 55-70%'),
('assignment_marks', 'low', 70.01, 100.00, 'Good assignment performance - above 70%'),

-- Midterm marks thresholds
('midterm_marks', 'critical', 0.00, 40.00, 'Critical midterm performance - below 40%'),
('midterm_marks', 'high', 40.01, 55.00, 'Poor midterm performance - 40-55%'),
('midterm_marks', 'medium', 55.01, 70.00, 'Average midterm performance - 55-70%'),
('midterm_marks', 'low', 70.01, 100.00, 'Good midterm performance - above 70%'),

-- Predicted marks thresholds
('predicted_marks', 'critical', 0.00, 40.00, 'Predicted to fail - urgent intervention needed'),
('predicted_marks', 'high', 40.01, 55.00, 'At risk of poor performance'),
('predicted_marks', 'medium', 55.01, 70.00, 'Average predicted performance'),
('predicted_marks', 'low', 70.01, 100.00, 'Good predicted performance');
