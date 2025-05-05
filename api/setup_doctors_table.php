<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

try {
    $query = "CREATE TABLE IF NOT EXISTS doctors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        specialization VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $pdo->exec($query);
    echo json_encode(['success' => true, 'message' => 'Doctors table created successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error creating doctors table: ' . $e->getMessage()]);
} 