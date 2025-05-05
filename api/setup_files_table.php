<?php
require_once __DIR__ . '/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INT NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        is_medical_report BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES patients(id) ON DELETE CASCADE
    )";
    
    $pdo->exec($sql);
    echo "Files table created successfully";
} catch(PDOException $e) {
    echo "Error creating files table: " . $e->getMessage();
}
?> 