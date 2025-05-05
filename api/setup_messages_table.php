<?php
require_once 'db.php';

$query = "CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    sender_type ENUM('doctor', 'patient') NOT NULL,
    recipient_id INT NOT NULL,
    recipient_type ENUM('doctor', 'patient') NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES patients(id) ON DELETE CASCADE
)";

try {
    $pdo->exec($query);
    echo json_encode(['success' => true, 'message' => 'Messages table created successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error creating messages table: ' . $e->getMessage()]);
} 