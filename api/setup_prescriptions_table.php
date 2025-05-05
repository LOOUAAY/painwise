<?php
require_once __DIR__ . '/db.php';

$query = "CREATE TABLE IF NOT EXISTS prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    schedule VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
)";

if ($conn->query($query)) {
    echo "Prescriptions table created successfully\n";
} else {
    echo "Error creating prescriptions table: " . $conn->error . "\n";
}

$conn->close(); 