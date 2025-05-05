<?php
require_once __DIR__ . '/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('appointment', 'message', 'prescription', 'reminder') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        related_id INT,
        FOREIGN KEY (user_id) REFERENCES patients(id) ON DELETE CASCADE
    )";
    
    $pdo->exec($sql);
    echo "Notifications table created successfully";
} catch(PDOException $e) {
    echo "Error creating notifications table: " . $e->getMessage();
}
?> 