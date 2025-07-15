-- Alert System Tables for Student Performance Management

-- Table to store alerts for both students and lecturers
CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `recipient_type` enum('student','lecturer') NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `alert_type` enum('performance','grade_prediction','improvement','warning','excellent') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `predicted_grade` decimal(5,2) DEFAULT NULL,
  `predicted_percentage` decimal(5,2) DEFAULT NULL,
  `is_read` boolean DEFAULT FALSE,
  `is_dismissed` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_type`, `recipient_id`),
  KEY `idx_student_course` (`student_id`, `course_id`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table to track alert generation history to prevent duplicate alerts
CREATE TABLE `alert_generation_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `alert_type` varchar(50) NOT NULL,
  `predicted_grade` decimal(5,2) DEFAULT NULL,
  `last_generated` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_course_type` (`student_id`, `course_id`, `alert_type`),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
