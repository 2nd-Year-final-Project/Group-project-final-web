-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 31, 2025 at 06:22 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_performance`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_inputs`
--

CREATE TABLE `admin_inputs` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `attendance` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_inputs`
--

INSERT INTO `admin_inputs` (`id`, `student_id`, `course_id`, `attendance`) VALUES
(1, 1, 3, 54.60),
(2, 1, 1, 78.90),
(3, 4, 2, 86.00),
(4, 4, 4, 90.40),
(5, 3, 3, 89.00),
(6, 3, 2, 78.00),
(7, 2, 2, NULL),
(8, 9, 2, 82.00),
(9, 11, 4, 87.00),
(10, 15, 4, 78.50),
(11, 17, 2, 72.00),
(12, 5, 10, 69.00),
(13, 1, 8, 78.00);

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
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
  `is_read` tinyint(1) DEFAULT 0,
  `is_dismissed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `student_id`, `course_id`, `recipient_type`, `recipient_id`, `alert_type`, `severity`, `title`, `message`, `predicted_grade`, `predicted_percentage`, `is_read`, `is_dismissed`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'student', 1, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Introduction to Cyber Security is predicted to achieve an A+ grade (95%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 95.00, 95.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(2, 2, 1, 'student', 2, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Introduction to Cyber Security is predicted to achieve an A grade (75%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 75.00, 75.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(3, 3, 2, 'student', 3, 'improvement', 'medium', 'Satisfactory - Room for Improvement', 'your performance in Data Structures & Algorithms is predicted to achieve a B+ grade (62%). While you\'re meeting basic requirements, there\'s good potential for improvement. Consider increasing study time and seeking clarification on challenging topics.', 62.00, 62.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(4, 3, 2, 'lecturer', 14, 'improvement', 'medium', 'Student Alert: Satisfactory - Room for Improvement', 'Renuja Sthnidu in Data Structures & Algorithms is predicted to achieve a B+ grade (62%). While Renuja Sthnidu\'re meeting basic requirements, there\'s good potential for improvement. Consider increasing study time and seeking clarification on challenging topics.', 62.00, 62.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(5, 4, 2, 'student', 4, 'warning', 'high', 'Poor Performance - Urgent Intervention Needed', 'your performance in Data Structures & Algorithms is predicted to achieve a C+ grade (45%). This performance is significantly below expectations. Urgent academic intervention is needed - please contact your lecturer immediately to discuss support options and create an improvement plan.', 45.00, 45.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(6, 4, 2, 'lecturer', 14, 'warning', 'high', 'Student Alert: Poor Performance - Urgent Intervention Needed', 'Anujaya Jayanath in Data Structures & Algorithms is predicted to achieve a C+ grade (45%). This performance is significantly below expectations. Urgent academic intervention is needed - please contact Anujaya Jayanathr lecturer immediately to discuss support options and create an improvement plan. Please consider reaching out to provide additional support and guidance.', 45.00, 45.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(7, 5, 3, 'student', 5, 'warning', 'critical', 'Critical Performance Alert - Immediate Support Required', 'your performance in Introduction to Web Development is predicted to achieve a D+ grade (30%). This represents a critical academic situation requiring immediate comprehensive support. Please contact your academic advisor and lecturer urgently to discuss intensive intervention strategies.', 30.00, 30.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(8, 5, 3, 'lecturer', 13, 'warning', 'critical', 'Student Alert: Critical Performance Alert - Immediate Support Required', 'Awanki Thathsaranie in Introduction to Web Development is predicted to achieve a D+ grade (30%). This represents a critical academic situation requiring immediate comprehensive support. Please contact Awanki Thathsaranier academic advisor and lecturer urgently to discuss intensive intervention strategies. Please consider reaching out to provide additional support and guidance.', 30.00, 30.00, 0, 0, '2025-07-15 05:12:42', '2025-07-15 05:12:42'),
(9, 3, 3, 'student', 3, 'warning', 'medium', 'Below Average - Action Needed', 'your performance in Introduction to Web Development is predicted to achieve a B grade (56.34%). Your performance is below average and requires attention. Schedule time with your lecturer, join study groups, and increase your weekly study hours to improve your understanding.', 56.34, 56.34, 0, 0, '2025-07-15 05:19:04', '2025-07-15 05:19:04'),
(10, 3, 3, 'lecturer', 13, 'warning', 'medium', 'Student Alert: Below Average - Action Needed', 'Renuja Sthnidu in Introduction to Web Development is predicted to achieve a B grade (56.34%). Your performance is below average and requires attention. Schedule time with Renuja Sthnidur lecturer, join study groups, and increase Renuja Sthnidu\'s weekly study hours to improve your understanding. Please consider reaching out to provide additional support and guidance.', 56.34, 56.34, 0, 0, '2025-07-15 05:19:04', '2025-07-15 05:19:04'),
(11, 3, 2, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Data Structures & Algorithms is predicted to achieve an A grade (77.76%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 77.76, 77.76, 0, 0, '2025-07-15 05:19:04', '2025-07-15 05:19:04'),
(12, 1, 1, 'student', 1, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Introduction to Cyber Security is predicted to achieve an A grade (84.43%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 84.43, 84.43, 0, 0, '2025-07-15 05:27:53', '2025-07-15 05:27:53'),
(13, 1, 3, 'student', 1, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Introduction to Web Development is predicted to achieve an A+ grade (92.09%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.09, 92.09, 0, 0, '2025-07-15 05:27:53', '2025-07-15 05:27:53'),
(14, 3, 8, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Buhbwuhbuhw is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-15 05:30:37', '2025-07-15 05:30:37'),
(15, 4, 2, 'student', 4, 'performance', 'low', 'Good Performance with Potential', 'Good work! your performance in Data Structures & Algorithms is predicted to achieve an A- grade (66.54%). You\'re on a positive track. Focus on strengthening core concepts to push your performance into the very good range.', 66.54, 66.54, 0, 0, '2025-07-15 07:41:17', '2025-07-15 07:41:17'),
(16, 4, 4, 'student', 4, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Database Management Systems is predicted to achieve an A+ grade (92.09%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.09, 92.09, 0, 0, '2025-07-15 07:41:17', '2025-07-15 07:41:17'),
(17, 15, 5, 'student', 15, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Software Engineering is predicted to achieve an A+ grade (92.14%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.14, 92.14, 0, 0, '2025-07-15 08:38:10', '2025-07-15 08:38:10'),
(18, 15, 4, 'student', 15, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Database Management Systems is predicted to achieve an A+ grade (92.14%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.14, 92.14, 0, 0, '2025-07-15 08:38:11', '2025-07-15 08:38:11'),
(19, 15, 4, 'student', 15, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Database Management Systems is predicted to achieve an A grade (77.8%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 77.80, 77.80, 0, 0, '2025-07-15 08:39:20', '2025-07-15 08:39:20'),
(20, 17, 2, 'student', 17, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Data Structures & Algorithms is predicted to achieve an A grade (80.33%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.33, 80.33, 0, 0, '2025-07-15 09:25:10', '2025-07-15 09:25:10'),
(21, 17, 2, 'student', 17, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Data Structures & Algorithms is predicted to achieve an A grade (72.37%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 72.37, 72.37, 0, 0, '2025-07-15 09:25:59', '2025-07-15 09:25:59'),
(22, 4, 4, 'student', 4, 'performance', 'low', 'Good Performance with Potential', 'Good work! your performance in Database Management Systems is predicted to achieve an A- grade (66.06%). You\'re on a positive track. Focus on strengthening core concepts to push your performance into the very good range.', 66.06, 66.06, 0, 0, '2025-07-15 09:28:25', '2025-07-15 09:28:25'),
(23, 2, 1, 'student', 2, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Introduction to Cyber Security is predicted to achieve an A+ grade (92.14%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.14, 92.14, 0, 0, '2025-07-15 09:30:41', '2025-07-15 09:30:41'),
(24, 2, 8, 'student', 2, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Advanced Operating Systems is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-15 09:30:41', '2025-07-15 09:30:41'),
(25, 3, 10, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Mathematics for computer science is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-15 10:52:25', '2025-07-15 10:52:25'),
(26, 2, 10, 'student', 2, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Mathematics for computer science is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-15 19:30:16', '2025-07-15 19:30:16'),
(27, 3, 2, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Data Structures & Algorithms is predicted to achieve an A grade (77.76%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 77.76, 77.76, 0, 0, '2025-07-29 02:55:39', '2025-07-29 02:55:39'),
(28, 3, 3, 'student', 3, 'warning', 'medium', 'Below Average - Action Needed', 'your performance in Introduction to Web Development is predicted to achieve a B grade (56.34%). Your performance is below average and requires attention. Schedule time with your lecturer, join study groups, and increase your weekly study hours to improve your understanding.', 56.34, 56.34, 0, 0, '2025-07-29 02:55:39', '2025-07-29 02:55:39'),
(29, 3, 8, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Advanced Operating Systems is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-29 02:55:39', '2025-07-29 02:55:39'),
(30, 3, 10, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Mathematics for computer science is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-29 02:55:39', '2025-07-29 02:55:39'),
(31, 3, 3, 'lecturer', 13, 'warning', 'medium', 'Student Alert: Below Average - Action Needed', 'Renuja Sthnidu in Introduction to Web Development is predicted to achieve a B grade (56.34%). Your performance is below average and requires attention. Schedule time with Renuja Sthnidur lecturer, join study groups, and increase Renuja Sthnidu\'s weekly study hours to improve your understanding. Please consider reaching out to provide additional support and guidance.', 56.34, 56.34, 0, 0, '2025-07-29 02:55:39', '2025-07-29 02:55:39'),
(32, 3, 10, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Mathematics for computer science is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-30 03:16:33', '2025-07-30 03:16:33'),
(33, 3, 3, 'student', 3, 'warning', 'medium', 'Below Average - Action Needed', 'your performance in Introduction to Web Development is predicted to achieve a B grade (56.34%). Your performance is below average and requires attention. Schedule time with your lecturer, join study groups, and increase your weekly study hours to improve your understanding.', 56.34, 56.34, 0, 0, '2025-07-30 03:16:33', '2025-07-30 03:16:33'),
(34, 3, 8, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Advanced Operating Systems is predicted to achieve an A grade (80.38%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.38, 80.38, 0, 0, '2025-07-30 03:16:33', '2025-07-30 03:16:33'),
(35, 3, 2, 'student', 3, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Data Structures & Algorithms is predicted to achieve an A grade (77.76%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 77.76, 77.76, 0, 0, '2025-07-30 03:16:33', '2025-07-30 03:16:33'),
(36, 3, 3, 'lecturer', 13, 'warning', 'medium', 'Student Alert: Below Average - Action Needed', 'Renuja Sthnidu in Introduction to Web Development is predicted to achieve a B grade (56.34%). Your performance is below average and requires attention. Schedule time with Renuja Sthnidur lecturer, join study groups, and increase Renuja Sthnidu\'s weekly study hours to improve your understanding. Please consider reaching out to provide additional support and guidance.', 56.34, 56.34, 0, 0, '2025-07-30 03:16:33', '2025-07-30 03:16:33'),
(37, 3, 3, 'student', 3, 'improvement', 'medium', 'Satisfactory - Room for Improvement', 'your performance in Introduction to Web Development is predicted to achieve a B+ grade (61.96%). While you\'re meeting basic requirements, there\'s good potential for improvement. Consider increasing study time and seeking clarification on challenging topics.', 61.96, 61.96, 0, 0, '2025-07-30 11:08:38', '2025-07-30 11:08:38'),
(38, 3, 3, 'lecturer', 13, 'improvement', 'medium', 'Student Alert: Satisfactory - Room for Improvement', 'Renuja Sthnidu in Introduction to Web Development is predicted to achieve a B+ grade (61.96%). While Renuja Sthnidu\'re meeting basic requirements, there\'s good potential for improvement. Consider increasing study time and seeking clarification on challenging topics.', 61.96, 61.96, 0, 0, '2025-07-30 11:08:38', '2025-07-30 11:08:38'),
(39, 4, 2, 'student', 4, 'performance', 'low', 'Good Performance with Potential', 'Good work! your performance in Data Structures & Algorithms is predicted to achieve an A- grade (65.59%). You\'re on a positive track. Focus on strengthening core concepts to push your performance into the very good range.', 65.59, 65.59, 0, 0, '2025-07-30 11:15:51', '2025-07-30 11:15:51'),
(40, 4, 10, 'student', 4, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Mathematics for computer science is predicted to achieve an A grade (80.21%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 80.21, 80.21, 0, 0, '2025-07-30 11:15:51', '2025-07-30 11:15:51'),
(41, 4, 4, 'student', 4, 'performance', 'low', 'Good Performance with Potential', 'Good work! your performance in Database Management Systems is predicted to achieve an A- grade (66.06%). You\'re on a positive track. Focus on strengthening core concepts to push your performance into the very good range.', 66.06, 66.06, 0, 0, '2025-07-30 11:15:51', '2025-07-30 11:15:51'),
(42, 1, 3, 'student', 1, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Introduction to Web Development is predicted to achieve an A+ grade (92.09%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.09, 92.09, 0, 0, '2025-07-30 11:19:51', '2025-07-30 11:19:51'),
(43, 10, 5, 'student', 10, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Software Engineering is predicted to achieve an A+ grade (92.2%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.20, 92.20, 0, 0, '2025-07-30 11:20:21', '2025-07-30 11:20:21'),
(44, 15, 5, 'student', 15, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Software Engineering is predicted to achieve an A+ grade (92.14%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.14, 92.14, 0, 0, '2025-07-30 11:20:21', '2025-07-30 11:20:21'),
(45, 17, 2, 'student', 17, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Data Structures & Algorithms is predicted to achieve an A grade (72.37%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 72.37, 72.37, 0, 0, '2025-07-30 11:24:39', '2025-07-30 11:24:39'),
(46, 11, 4, 'student', 11, 'excellent', 'low', 'Outstanding Performance Predicted!', 'Excellent work! your performance in Database Management Systems is predicted to achieve an A+ grade (92.25%). You\'re demonstrating exceptional understanding and are on track for outstanding results. Keep up the excellent work and consider helping peers who might be struggling.', 92.25, 92.25, 0, 0, '2025-07-30 11:25:06', '2025-07-30 11:25:06'),
(47, 15, 4, 'student', 15, 'performance', 'low', 'Strong Performance on Track', 'Great progress! your performance in Database Management Systems is predicted to achieve an A grade (77.8%). You\'re performing very well and should maintain your current study approach. Consider challenging yourself with additional advanced topics.', 77.80, 77.80, 0, 0, '2025-07-30 11:25:06', '2025-07-30 11:25:06');

-- --------------------------------------------------------

--
-- Table structure for table `alert_generation_log`
--

CREATE TABLE `alert_generation_log` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `alert_type` varchar(50) NOT NULL,
  `predicted_grade` decimal(5,2) DEFAULT NULL,
  `last_generated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alert_generation_log`
--

INSERT INTO `alert_generation_log` (`id`, `student_id`, `course_id`, `alert_type`, `predicted_grade`, `last_generated`) VALUES
(1, 1, 1, 'excellent', 95.00, '2025-07-15 05:12:42'),
(2, 2, 1, 'performance', 75.00, '2025-07-15 05:12:42'),
(3, 3, 2, 'improvement', 62.00, '2025-07-15 05:12:42'),
(4, 3, 2, 'lecturer_improvement', 62.00, '2025-07-15 05:12:42'),
(5, 4, 2, 'warning', 45.00, '2025-07-15 05:12:42'),
(6, 4, 2, 'lecturer_warning', 45.00, '2025-07-15 05:12:42'),
(7, 5, 3, 'warning', 30.00, '2025-07-15 05:12:42'),
(8, 5, 3, 'lecturer_warning', 30.00, '2025-07-15 05:12:42'),
(9, 3, 3, 'warning', 56.34, '2025-07-30 03:16:33'),
(10, 3, 3, 'lecturer_warning', 56.34, '2025-07-30 03:16:33'),
(11, 3, 2, 'performance', 77.76, '2025-07-30 03:16:33'),
(12, 1, 1, 'performance', 84.43, '2025-07-15 05:27:53'),
(13, 1, 3, 'excellent', 92.09, '2025-07-30 11:19:51'),
(14, 3, 8, 'performance', 80.38, '2025-07-30 03:16:33'),
(15, 4, 2, 'performance', 65.59, '2025-07-30 11:15:51'),
(16, 4, 4, 'excellent', 92.09, '2025-07-15 07:41:17'),
(17, 15, 5, 'excellent', 92.14, '2025-07-30 11:20:21'),
(18, 15, 4, 'excellent', 92.14, '2025-07-15 08:38:11'),
(19, 15, 4, 'performance', 77.80, '2025-07-30 11:25:06'),
(20, 17, 2, 'performance', 72.37, '2025-07-30 11:24:39'),
(22, 4, 4, 'performance', 66.06, '2025-07-30 11:15:51'),
(23, 2, 1, 'excellent', 92.14, '2025-07-15 09:30:41'),
(24, 2, 8, 'performance', 80.38, '2025-07-15 09:30:41'),
(25, 3, 10, 'performance', 80.38, '2025-07-30 03:16:33'),
(26, 2, 10, 'performance', 80.38, '2025-07-15 19:30:16'),
(37, 3, 3, 'improvement', 61.96, '2025-07-30 11:08:38'),
(38, 3, 3, 'lecturer_improvement', 61.96, '2025-07-30 11:08:38'),
(40, 4, 10, 'performance', 80.21, '2025-07-30 11:15:51'),
(43, 10, 5, 'excellent', 92.20, '2025-07-30 11:20:21'),
(46, 11, 4, 'excellent', 92.25, '2025-07-30 11:25:06');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `credits` int(11) DEFAULT 3,
  `difficulty_level` enum('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_code`, `course_name`, `description`, `credits`, `difficulty_level`, `created_at`, `updated_at`) VALUES
(1, 'CSCI 22062', 'Introduction to Cyber Security', 'Fundamentals of cybersecurity, threat analysis, and security measures', 3, 'Medium', '2025-07-14 05:56:13', '2025-07-30 02:44:07'),
(2, 'CSCI 22022', 'Data Structures & Algorithms', 'Advanced data structures and algorithmic problem solving', 4, 'Hard', '2025-07-14 05:56:13', '2025-07-30 02:43:58'),
(3, 'CSCI 22052', 'Introduction to Web Development', 'Frontend and backend web development technologies', 3, 'Medium', '2025-07-14 05:56:13', '2025-07-30 02:43:46'),
(4, 'CSCI 22032', 'Database Management Systems', 'Design and implementation of database systems', 3, 'Medium', '2025-07-14 05:56:13', '2025-07-30 02:43:30'),
(5, 'CSCI 22042', 'Software Engineering', 'Software development lifecycle and engineering practices', 2, 'Medium', '2025-07-14 05:56:13', '2025-07-30 02:43:19'),
(6, 'CSCI 12043', 'Computer Architecture', '', 3, 'Easy', '2025-07-14 06:12:55', '2025-07-15 09:01:57'),
(7, 'CSCI 22034', 'Statistics ', '', 4, 'Medium', '2025-07-14 06:15:08', '2025-07-15 09:02:38'),
(8, 'CSCI 72819', 'Advanced Operating Systems', 'Advanced concepts of Operating systemssasadsasdYour registration will be revie', 3, 'Hard', '2025-07-14 06:15:49', '2025-07-29 02:19:28'),
(10, 'CSCI 12032', 'Mathematics for computer science', '', 3, 'Hard', '2025-07-15 09:35:59', '2025-07-15 09:35:59');

-- --------------------------------------------------------

--
-- Table structure for table `lecturer_courses`
--

CREATE TABLE `lecturer_courses` (
  `id` int(11) NOT NULL,
  `lecturer_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lecturer_courses`
--

INSERT INTO `lecturer_courses` (`id`, `lecturer_id`, `course_id`, `assigned_at`) VALUES
(2, 13, 3, '2025-07-14 06:21:20'),
(3, 14, 4, '2025-07-14 06:40:36'),
(4, 13, 5, '2025-07-14 06:41:19'),
(5, 14, 2, '2025-07-14 08:57:54'),
(6, 12, 5, '2025-07-14 13:57:38'),
(7, 16, 10, '2025-07-15 09:38:35'),
(8, 12, 6, '2025-07-15 11:28:40');

-- --------------------------------------------------------

--
-- Table structure for table `lecturer_marks`
--

CREATE TABLE `lecturer_marks` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `quiz1` decimal(5,2) DEFAULT NULL,
  `quiz2` decimal(5,2) DEFAULT NULL,
  `assignment1` decimal(5,2) DEFAULT NULL,
  `assignment2` decimal(5,2) DEFAULT NULL,
  `midterm_marks` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lecturer_marks`
--

INSERT INTO `lecturer_marks` (`id`, `student_id`, `course_id`, `quiz1`, `quiz2`, `assignment1`, `assignment2`, `midterm_marks`) VALUES
(1, 3, 3, 34.00, 54.00, 91.00, 89.00, 78.00),
(2, 3, 2, NULL, NULL, 92.00, 83.00, 73.00),
(3, 2, 2, 17.00, NULL, 10.00, NULL, 12.00),
(4, 1, 1, 78.00, NULL, NULL, NULL, NULL),
(5, 4, 2, 72.00, 86.00, 86.00, 68.00, 78.00),
(6, 15, 4, 78.00, 83.00, 92.00, NULL, NULL),
(7, 17, 2, 74.00, NULL, 88.00, NULL, NULL),
(8, 4, 4, 23.00, 10.00, NULL, NULL, 10.00),
(9, 5, 10, 73.00, 42.00, 87.00, 81.00, 73.00),
(10, 9, 2, 42.00, 57.00, 86.00, 64.00, 74.00);

-- --------------------------------------------------------

--
-- Table structure for table `pending_users`
--

CREATE TABLE `pending_users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('student','lecturer') NOT NULL,
  `id_card` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pending_users`
--

INSERT INTO `pending_users` (`id`, `full_name`, `email`, `role`, `id_card`, `status`, `created_at`) VALUES
(42, 'Skwmkksm', 'jwnnjn@gmail.com', 'student', '1753623279328.jpg', 'rejected', '2025-07-27 13:34:39'),
(43, 'dnkjnd', 'wjnjn@gg.com', 'student', '1753623505090.jpg', 'rejected', '2025-07-27 13:38:25');

-- --------------------------------------------------------

--
-- Table structure for table `student_common_data`
--

CREATE TABLE `student_common_data` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `gender` tinyint(4) DEFAULT NULL,
  `peer_influence` tinyint(4) DEFAULT NULL,
  `motivation_level` tinyint(4) DEFAULT NULL,
  `extracurricular_activities` tinyint(4) DEFAULT NULL,
  `physical_activity` tinyint(4) DEFAULT NULL,
  `sleep_hours` decimal(3,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_common_data`
--

INSERT INTO `student_common_data` (`id`, `student_id`, `gender`, `peer_influence`, `motivation_level`, `extracurricular_activities`, `physical_activity`, `sleep_hours`) VALUES
(1, 1, 1, 1, 1, 0, 3, 6.5),
(6, 4, 1, 0, 0, 1, 4, 12.0),
(7, 10, 0, 0, 1, 1, 3, 7.0),
(8, 3, 1, 1, NULL, 0, 4, 7.0),
(9, 2, 1, 1, NULL, 1, 3, 7.0),
(10, 11, 0, 0, NULL, 0, 2, 4.0),
(11, 15, 1, 0, NULL, 1, 2, 7.0),
(12, 17, 1, 2, 1, 1, 3, 6.0);

-- --------------------------------------------------------

--
-- Table structure for table `student_enrollments`
--

CREATE TABLE `student_enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrollment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','dropped','completed') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_enrollments`
--

INSERT INTO `student_enrollments` (`id`, `student_id`, `course_id`, `enrollment_date`, `status`) VALUES
(1, 1, 1, '2025-07-14 06:21:04', 'active'),
(2, 2, 1, '2025-07-14 06:21:12', 'active'),
(3, 1, 3, '2025-07-14 06:21:35', 'active'),
(4, 3, 3, '2025-07-14 06:21:43', 'active'),
(5, 4, 4, '2025-07-14 06:40:48', 'active'),
(6, 5, 4, '2025-07-14 06:41:00', 'active'),
(7, 9, 2, '2025-07-14 06:44:54', 'active'),
(8, 2, 2, '2025-07-14 08:57:36', 'active'),
(9, 3, 2, '2025-07-14 08:57:36', 'active'),
(10, 4, 2, '2025-07-14 08:57:44', 'active'),
(11, 10, 5, '2025-07-14 13:57:45', 'active'),
(12, 11, 4, '2025-07-14 14:00:43', 'active'),
(13, 1, 8, '2025-07-15 05:30:03', 'active'),
(14, 2, 8, '2025-07-15 05:30:03', 'active'),
(15, 3, 8, '2025-07-15 05:30:03', 'active'),
(16, 15, 4, '2025-07-15 08:36:10', 'active'),
(17, 15, 5, '2025-07-15 08:36:27', 'active'),
(18, 17, 2, '2025-07-15 09:23:01', 'active'),
(21, 2, 10, '2025-07-15 09:36:30', 'active'),
(22, 3, 10, '2025-07-15 09:36:30', 'active'),
(23, 4, 10, '2025-07-15 09:36:30', 'active'),
(24, 5, 10, '2025-07-15 09:36:30', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `student_subject_data`
--

CREATE TABLE `student_subject_data` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `hours_studied` decimal(4,2) DEFAULT NULL,
  `teacher_quality` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_subject_data`
--

INSERT INTO `student_subject_data` (`id`, `student_id`, `course_id`, `hours_studied`, `teacher_quality`) VALUES
(1, 3, 3, 13.00, 1),
(2, 3, 2, 2.00, 0),
(3, 2, 2, 5.00, 2),
(4, 11, 4, 2.00, 2),
(5, 17, 2, 7.00, 2),
(6, 3, 8, 1.00, 1),
(7, 4, 4, 0.00, 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('student','lecturer','admin') NOT NULL,
  `gender` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `password`, `role`, `gender`, `created_at`) VALUES
(1, 'akila1824', 'Akila Fernando', 'fernand-cs21058@stu.kln.ac.lk', '$2b$10$zfundww7r1oYlJDvok4Rf.82S1OWGVEO9WMXFBkyXfaEyBPguc8KC', 'student', NULL, '2025-07-09 13:38:03'),
(2, 'hiruna7231', 'Kavindu Pasan ', 'example1@gmail.com', '$2b$10$.pazXFDA.KMhMKJ2EhgUt.vNHr/vzWtW7EQlPBpMNov7uGKgh08Km', 'student', NULL, '2025-07-14 03:37:49'),
(3, 'renuja9713', 'Renuja Sthnidu', 'example2@gmail.com', '$2b$10$GsEu.xw7Q9g/GYLCBwtljO9JNjajNxALTuioVjtgN3B3OQBexXpkq', 'student', NULL, '2025-07-14 03:45:03'),
(4, 'anujaya6836', 'Anujaya Jayanath', 'example3@gmail.com', '$2b$10$VhQ7AO2qncPiBSWulpn5eeBskcOrK22lxsnL7dgbdAq0X7oLxmHFC', 'student', NULL, '2025-07-14 03:52:43'),
(5, 'awanki2505', 'Awanki Thathsaranie', 'xample4@gmail.com', '$2b$10$3IyInNoWcrleodOCrdVBreZVnZNGx4kZXNYJUE5H0rjlVkBW0ll.6', 'student', NULL, '2025-07-14 03:52:48'),
(6, 'tharushi8670', 'Tharushi Perera', 'example5@gmail.com', '$2b$10$Rs.vt30tlsiGH28lAbsqFuM1zINZ1wJUvyKNEdx7BK8ArNrNCZaZW', 'student', NULL, '2025-07-14 03:52:53'),
(7, 'akila3634', 'Akila Fernando', 'example6@gmail.com', '$2b$10$nNIBDlfG0YXv1BxCpJCo0.sxVJa9Ar9UeJb9AOgf2gZFjfQvNO3Lu', 'student', NULL, '2025-07-14 03:52:59'),
(8, 'pasindu5124', 'Pasindu Silva', 'example7@gmail.com', '$2b$10$p0byMionFVz8yfDgVb1NvucYvq6l2gc9f.rTifXF0ZggjyVp/xs2W', 'student', NULL, '2025-07-14 03:53:03'),
(9, 'sithara7217', 'Sithara Hansamali', 'example8@gmail.com', '$2b$10$QlvrnUdEsWbvCAD3Iowv1O0O5DI0N3ezRw45R3FS80kE4lnY3g0RO', 'student', NULL, '2025-07-14 03:53:06'),
(10, 'anumi5465', 'Anumi Vithana', 'example9@gmail.com', '$2b$10$ML0pGMHXC515lQ4bGdKrz.IXUD58s47M3GuYjGozwJoZQ0Fi5C012', 'student', NULL, '2025-07-14 03:53:12'),
(11, 'ashika7850', 'Ashika Chamodi', 'example10@gmail.com', '$2b$10$/XT.1DrvkHkxSsXgfIxZ0evN8sJmIfuZ5TBjFw4Tn6bmtUsUcqvH6', 'student', NULL, '2025-07-14 03:53:17'),
(12, 'subhoda1273', 'Subhoda Rathnayake', 'lecturer1@gmail.com', '$2b$10$ySFRdum2oL7w.3bS7T07quBGNYzPXdpIXg8YnDvFrzk4vHDQCkcZ2', 'lecturer', NULL, '2025-07-14 03:53:21'),
(13, 'navodi8813', 'Navodi Mekala', 'lecturer2@gmail.com', '$2b$10$CB59vQlUV0kvzK47jGYZ2ODCRh/b7VdsE5Atbp5ol6DzoI4stscyC', 'lecturer', NULL, '2025-07-14 03:53:25'),
(14, 'sidath7328', 'Sidath Liyanage', 'lecturer3@gmail.com', '$2b$10$OMr.8hFj6KkpdPXXu14ngO1ka.h7LYweKXIJ4AQ/1BxPoBjtX7Snm', 'lecturer', NULL, '2025-07-14 03:53:29'),
(15, 'hiruna6837', 'Hiruna Mendis', 'hirunamendis@gmail.com', '$2b$10$LmuIuaSvZljA5a16wwuIw.RMmAfnNSYcpupAYTpTVqPmg89bMVzrq', 'student', NULL, '2025-07-15 08:34:57'),
(16, 'vihan7343', 'Vihan Perera', 'anujayanath16@gmail.com', '$2b$10$NqbEG0wQ67QplfeGoWkTWuWV7Gn5jJVTmbr0ZAl.zmJvp8Wfm5ife', 'lecturer', NULL, '2025-07-15 09:13:58'),
(17, 'harin5050', 'Harin Dulneth', 'harindulneth8@gmail.com', '$2b$10$85b0JDg5wa9r.kwzkK0SWufz3xG6z3Wej/AR3ZYdJykCLyLQle/A2', 'student', NULL, '2025-07-15 09:21:10'),
(18, 'anujaa4306', 'Anujaa', 'renujasathnidu@gmail.com', '$2b$10$kh.MIrA5QIu3Iik85TbLue1eKmLSPGgbHqVK7grO1r8V.jtP6HYga', 'student', NULL, '2025-07-15 11:23:02'),
(20, 'akjskjiwj8497', 'Akjskjiwj', 'harindulneth7@gmail.com', '$2b$10$nupMuu5Es5XhLcUiL3sK1u/iOuKeI8kN20j4.f0pdJ7d5I537jaRy', 'student', NULL, '2025-07-27 13:05:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_inputs`
--
ALTER TABLE `admin_inputs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_course_unique` (`student_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient` (`recipient_type`,`recipient_id`),
  ADD KEY `idx_student_course` (`student_id`,`course_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Indexes for table `alert_generation_log`
--
ALTER TABLE `alert_generation_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_course_type` (`student_id`,`course_id`,`alert_type`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_code` (`course_code`);

--
-- Indexes for table `lecturer_courses`
--
ALTER TABLE `lecturer_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lecturer_course_unique` (`lecturer_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `lecturer_marks`
--
ALTER TABLE `lecturer_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_course_unique` (`student_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `pending_users`
--
ALTER TABLE `pending_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `student_common_data`
--
ALTER TABLE `student_common_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_course_unique` (`student_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `student_subject_data`
--
ALTER TABLE `student_subject_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_course_unique` (`student_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_inputs`
--
ALTER TABLE `admin_inputs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `alert_generation_log`
--
ALTER TABLE `alert_generation_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lecturer_courses`
--
ALTER TABLE `lecturer_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `lecturer_marks`
--
ALTER TABLE `lecturer_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pending_users`
--
ALTER TABLE `pending_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `student_common_data`
--
ALTER TABLE `student_common_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `student_subject_data`
--
ALTER TABLE `student_subject_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_inputs`
--
ALTER TABLE `admin_inputs`
  ADD CONSTRAINT `admin_inputs_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_inputs_student_fk` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alerts_ibfk_3` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `alert_generation_log`
--
ALTER TABLE `alert_generation_log`
  ADD CONSTRAINT `alert_generation_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alert_generation_log_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturer_courses`
--
ALTER TABLE `lecturer_courses`
  ADD CONSTRAINT `lecturer_courses_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lecturer_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturer_marks`
--
ALTER TABLE `lecturer_marks`
  ADD CONSTRAINT `lecturer_marks_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lecturer_marks_student_fk` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_common_data`
--
ALTER TABLE `student_common_data`
  ADD CONSTRAINT `student_common_data_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  ADD CONSTRAINT `student_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_subject_data`
--
ALTER TABLE `student_subject_data`
  ADD CONSTRAINT `student_subject_data_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subject_data_student_fk` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
