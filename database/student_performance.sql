-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 09, 2025 at 04:16 PM
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
  `subject_id` int(11) NOT NULL,
  `attendance` decimal(5,2) DEFAULT NULL,
  `motivation_level` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_inputs`
--

INSERT INTO `admin_inputs` (`id`, `student_id`, `subject_id`, `attendance`, `motivation_level`) VALUES
(1, 1, 3, 82.50, 1);

-- --------------------------------------------------------

--
-- Table structure for table `lecturer_marks`
--

CREATE TABLE `lecturer_marks` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `quiz1` decimal(5,2) DEFAULT NULL,
  `quiz2` decimal(5,2) DEFAULT NULL,
  `assignment1` decimal(5,2) DEFAULT NULL,
  `assignment2` decimal(5,2) DEFAULT NULL,
  `midterm_marks` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lecturer_marks`
--

INSERT INTO `lecturer_marks` (`id`, `student_id`, `subject_id`, `quiz1`, `quiz2`, `assignment1`, `assignment2`, `midterm_marks`) VALUES
(1, 1, 3, 90.00, 85.00, 88.00, 92.00, 78.00);

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
(1, 1, 1, 1, 1, 0, 3, 6.5);

-- --------------------------------------------------------

--
-- Table structure for table `student_subject_data`
--

CREATE TABLE `student_subject_data` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `hours_studied` decimal(4,2) DEFAULT NULL,
  `teacher_quality` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_subject_data`
--

INSERT INTO `student_subject_data` (`id`, `student_id`, `subject_id`, `hours_studied`, `teacher_quality`) VALUES
(1, 1, 3, 10.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `difficulty_level` enum('Easy','Medium','Hard') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `subject_name`, `difficulty_level`) VALUES
(1, 'Programming Fundamentals', 'Easy'),
(2, 'Data Structures', 'Medium'),
(3, 'Machine Learning', 'Hard'),
(4, 'Computer Networks', 'Medium'),
(5, 'Digital Image Processing', 'Hard');

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
(1, 'akila1824', 'Akila Fernando', 'fernand-cs21058@stu.kln.ac.lk', '$2b$10$zfundww7r1oYlJDvok4Rf.82S1OWGVEO9WMXFBkyXfaEyBPguc8KC', 'student', NULL, '2025-07-09 13:38:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_inputs`
--
ALTER TABLE `admin_inputs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `lecturer_marks`
--
ALTER TABLE `lecturer_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`);

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
-- Indexes for table `student_subject_data`
--
ALTER TABLE `student_subject_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lecturer_marks`
--
ALTER TABLE `lecturer_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pending_users`
--
ALTER TABLE `pending_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `student_common_data`
--
ALTER TABLE `student_common_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_subject_data`
--
ALTER TABLE `student_subject_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_inputs`
--
ALTER TABLE `admin_inputs`
  ADD CONSTRAINT `admin_inputs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_inputs_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturer_marks`
--
ALTER TABLE `lecturer_marks`
  ADD CONSTRAINT `lecturer_marks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lecturer_marks_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_common_data`
--
ALTER TABLE `student_common_data`
  ADD CONSTRAINT `student_common_data_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_subject_data`
--
ALTER TABLE `student_subject_data`
  ADD CONSTRAINT `student_subject_data_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subject_data_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
