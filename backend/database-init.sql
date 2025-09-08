-- Smart Campus Portal Database Initialization
-- Run this on your RDS MySQL instance

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS smartcampus;
USE smartcampus;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  user_type ENUM('Admin', 'Student') NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_user_type (user_type)
);

-- Insert default admin user
INSERT IGNORE INTO users (user_id, name, email, user_type, status) VALUES
('admin001', 'Administrator', 'admin001@campus.edu', 'Admin', 'Active');

-- Insert default student users
INSERT IGNORE INTO users (user_id, name, email, user_type, status) VALUES
('student001', 'John Doe', 'student001@campus.edu', 'Student', 'Active'),
('student002', 'Jane Smith', 'student002@campus.edu', 'Student', 'Active'),
('student003', 'Mike Johnson', 'student003@campus.edu', 'Student', 'Active');

-- Verify the data
SELECT * FROM users;