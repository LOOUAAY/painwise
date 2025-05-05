<?php
require_once __DIR__ . '/db.php';

$query = "CREATE TABLE IF NOT EXISTS notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    content TEXT NOT NULL,
    created_by_type ENUM('doctor', 'patient') NOT NULL,
    created_by_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
)";

if ($conn->query($query)) {
    echo "Notes table created successfully\n";
} else {
    echo "Error creating notes table: " . $conn->error . "\n";
}

$conn->close(); 