-- Smart Campus Portal Database Setup
-- Connect to your RDS MySQL instance and run these commands

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  user_type ENUM('Admin', 'Student') NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert test users
INSERT INTO users (user_id, name, email, user_type, status) VALUES
('admin001', 'Administrator', 'admin001@campus.edu', 'Admin', 'Active'),
('student001', 'John Doe', 'student001@campus.edu', 'Student', 'Active'),
('student002', 'Jane Smith', 'student002@campus.edu', 'Student', 'Active'),
('student003', 'Mike Johnson', 'student003@campus.edu', 'Student', 'Active');

-- Verify the data
SELECT * FROM users;