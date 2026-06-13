-- Advanced Todo List — Database Schema
-- Run this in phpMyAdmin or MySQL CLI

CREATE DATABASE IF NOT EXISTS todolistsys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todolistsys;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    text        TEXT NOT NULL,
    category    VARCHAR(50) DEFAULT 'General',
    completed   TINYINT(1) DEFAULT 0,
    date_time   DATETIME NULL,
    sort_order  INT DEFAULT 0,
    notified    TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    todo_id     INT NOT NULL,
    text        TEXT NOT NULL,
    completed   TINYINT(1) DEFAULT 0,
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);
