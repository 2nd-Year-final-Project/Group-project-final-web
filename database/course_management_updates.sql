-- Course Management System Database Updates
-- Add these tables to your existing database

-- Table for courses (combining subjects with additional course information)
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) NOT NULL UNIQUE,
  `course_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `credits` int(11) DEFAULT 3,
  `difficulty_level` enum('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for lecturer course assignments
CREATE TABLE `lecturer_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lecturer_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `lecturer_course_unique` (`lecturer_id`, `course_id`),
  FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for student course enrollments
CREATE TABLE `student_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrollment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','dropped','completed') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_course_unique` (`student_id`, `course_id`),
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert some sample courses
INSERT INTO `courses` (`course_code`, `course_name`, `description`, `credits`, `difficulty_level`) VALUES
('CSCI22062', 'Introduction to Cyber Security', 'Fundamentals of cybersecurity, threat analysis, and security measures', 3, 'Medium'),
('CSCI22022', 'Data Structures & Algorithms', 'Advanced data structures and algorithmic problem solving', 4, 'Hard'),
('CSCI22052', 'Introduction to Web Development', 'Frontend and backend web development technologies', 3, 'Easy'),
('CSCI22032', 'Database Management Systems', 'Design and implementation of database systems', 3, 'Medium'),
('CSCI22042', 'Software Engineering', 'Software development lifecycle and engineering practices', 4, 'Medium');
