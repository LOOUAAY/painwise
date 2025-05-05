<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    // Create patients table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create doctor_patient relationship table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS doctor_patient (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        patient_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        UNIQUE KEY unique_doctor_patient (doctor_id, patient_id)
    )");

    // Add prescriptions table
    $prescriptions_sql = "CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        time VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($prescriptions_sql);

    // Add pain_log_comments table
    $pain_log_comments_sql = "CREATE TABLE IF NOT EXISTS pain_log_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_id INT NOT NULL,
        doctor_id INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (log_id) REFERENCES pain_logs(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($pain_log_comments_sql);

    // Add appointments table
    $appointments_sql = "CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        patient_id INT NOT NULL,
        datetime DATETIME NOT NULL,
        type VARCHAR(100),
        notes TEXT,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        reminder_sent BOOLEAN DEFAULT FALSE,
        reminder_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($appointments_sql);

    // Add pain_logs table
    $pain_logs_sql = "CREATE TABLE IF NOT EXISTS pain_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        pain_points TEXT NOT NULL,
        functionality VARCHAR(50),
        mood VARCHAR(50),
        anxiety VARCHAR(50),
        sleep VARCHAR(50),
        medication TEXT,
        nutrition TEXT,
        exercise TEXT,
        log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;";
    $pdo->exec($pain_logs_sql);

    echo json_encode([
        'success' => true,
        'message' => 'Patients and doctor_patient tables setup completed'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 