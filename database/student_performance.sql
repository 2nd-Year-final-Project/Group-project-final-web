-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 15, 2025 at 08:03 AM
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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('student','lecturer') NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `username` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `role`, `password`, `created_at`, `username`) VALUES
(7, 'Akila Fernando', 'chandaniekariyawasam18@gmail.com', 'lecturer', '$2b$10$llNEW3wiaqQttvrbL/njj.i9KF7N/EG0dejDJN8NZmv.kwhAOiBmu', '2025-03-13 11:40:00', 'akila5519'),
(8, 'Jagath Fernando', 'kjagathfernando184@gmail.com', 'student', '$2b$10$NJvBrKywWV9ozQ8c0760aO5atPzgroJ3roR7Z3xWiIBKV.lI.YTC2', '2025-03-13 13:02:51', 'jagath6937'),
(9, 'Pasan De Silva', 'fernand-cs21058@stu.kln.ac.lk', 'student', '$2b$10$JCFDCrBLfC7SpcM3tWhjbuzAZDhSJ1TN1UQm2iINEHADkESxc9i3O', '2025-03-14 02:12:07', 'pasan9354');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pending_users`
--
ALTER TABLE `pending_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pending_users`
--
ALTER TABLE `pending_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
