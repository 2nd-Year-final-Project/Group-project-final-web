-- Alert System Database Schema
-- Add this to your database

-- Table for storing alerts/notifications
CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `lecturer_id` int(11) NOT NULL,
  `alert_type` enum('at_risk', 'failing', 'improvement_needed', 'critical') NOT NULL DEFAULT 'at_risk',
  `severity` enum('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `predicted_grade` decimal(5,2) DEFAULT NULL,
  `current_average` decimal(5,2) DEFAULT NULL,
  `risk_factors` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `student_notified` tinyint(1) DEFAULT 0,
  `lecturer_notified` tinyint(1) DEFAULT 0,
  `admin_notified` tinyint(1) DEFAULT 0,
  `is_read_by_student` tinyint(1) DEFAULT 0,
  `is_read_by_lecturer` tinyint(1) DEFAULT 0,
  `is_read_by_admin` tinyint(1) DEFAULT 0,
  `is_resolved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  KEY `lecturer_id` (`lecturer_id`),
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for alert preferences (optional - for future enhancement)
CREATE TABLE `alert_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `dashboard_notifications` tinyint(1) DEFAULT 1,
  `severity_threshold` enum('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
