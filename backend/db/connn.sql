-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        11.3.2-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- connn 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `connn` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `connn`;

-- 테이블 connn.categories 구조 내보내기
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 테이블 데이터 connn.categories:~7 rows (대략적) 내보내기
DELETE FROM `categories`;
INSERT INTO `categories` (`category_id`, `category_name`, `description`, `created_at`, `updated_at`) VALUES
	(0, 'ALL', '', '2024-05-27 04:58:09', '2024-05-30 06:34:58'),
	(2, '리그 오브 레전드', '', '2024-05-27 04:58:26', '2024-05-27 04:58:26'),
	(3, '배틀 그라운드', '', '2024-05-27 04:59:29', '2024-05-27 04:59:29'),
	(4, '던전앤파이터', '', '2024-05-27 04:59:51', '2024-05-27 05:28:16'),
	(5, '주식/코인', '', '2024-05-27 05:00:07', '2024-05-27 05:00:07'),
	(6, '고민상담', '', '2024-05-27 05:00:19', '2024-05-27 05:00:19'),
	(7, '기타', '', '2024-05-27 05:00:30', '2024-05-28 05:58:23');

-- 테이블 connn.chat_rooms 구조 내보내기
CREATE TABLE IF NOT EXISTS `chat_rooms` (
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `total_members` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 테이블 데이터 connn.chat_rooms:~1 rows (대략적) 내보내기
DELETE FROM `chat_rooms`;
INSERT INTO `chat_rooms` (`room_id`, `category_id`, `title`, `total_members`, `created_at`, `updated_at`, `status`) VALUES
	(1, 2, '캐니언 모십니다', 5, '2024-05-28 06:42:34', '2024-05-28 06:42:34', 'active'),
	(2, 2, '롤 한판하까?', 5, '2024-05-30 07:08:29', '2024-05-30 07:08:29', 'active');

-- 테이블 connn.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 테이블 데이터 connn.users:~2 rows (대략적) 내보내기
DELETE FROM `users`;
INSERT INTO `users` (`user_id`, `room_id`, `name`, `status`, `created_at`, `updated_at`) VALUES
	(1, 1, '쉘던', 'active', '2024-05-30 06:13:52', '2024-05-30 06:13:52'),
	(2, 1, '레너드', 'active', '2024-05-30 06:14:02', '2024-05-30 06:14:02');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
