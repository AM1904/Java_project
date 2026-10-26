-- Split & Expense Tracker -- MySQL Database Setup
-- Run: Get-Content sql\setup.sql | mysql -u root -p

CREATE DATABASE IF NOT EXISTS expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

CREATE TABLE IF NOT EXISTS users (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)   NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Note: UNIQUE on username already creates an index automatically.
-- No separate CREATE INDEX needed.

-- Sample test data (optional - uncomment to use):
-- INSERT INTO users (username, password) VALUES ('rahul', 'rahul123');
-- INSERT INTO users (username, password) VALUES ('ananya', 'ananya123');