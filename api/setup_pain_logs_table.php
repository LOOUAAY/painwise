<?php
require_once __DIR__ . '/db.php';

try {
    $query = "CREATE TABLE IF NOT EXISTS pain_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 0 AND rating <= 10),
        location JSON,
        type VARCHAR(50),
        notes TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )";

    $pdo->exec($query);
    echo json_encode(['success' => true, 'message' => 'Pain logs table created successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error creating pain logs table: ' . $e->getMessage()]);
} 