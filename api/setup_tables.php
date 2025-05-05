<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');
$response = ['success' => true, 'messages' => []];

try {
    // Set PDO to throw exceptions on error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create patients table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        age INT NULL,
        gender VARCHAR(50) NULL,
        phone VARCHAR(50) NULL,
        address TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $response['messages'][] = "Patients table setup complete";
    
    // Create doctors table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $response['messages'][] = "Doctors table setup complete";
    
    // Create doctor_patient relationship table
    $pdo->exec("CREATE TABLE IF NOT EXISTS doctor_patient (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        patient_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        UNIQUE KEY unique_relationship (doctor_id, patient_id)
    )");
    $response['messages'][] = "Doctor-Patient relationship table setup complete";
    
    // Create medical_history table
    $pdo->exec("CREATE TABLE IF NOT EXISTS medical_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        condition_name VARCHAR(255) NOT NULL,
        diagnosed_date DATE NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )");
    $response['messages'][] = "Medical history table setup complete";
    
    // Create prescriptions table
    $pdo->exec("CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        schedule VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        notes TEXT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )");
    $response['messages'][] = "Prescriptions table setup complete";
    
    // Create appointments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )");
    $response['messages'][] = "Appointments table setup complete";
    
    // Create pain_logs table
    $pdo->exec("CREATE TABLE IF NOT EXISTS pain_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        pain_points INT NOT NULL,
        functionality INT NOT NULL,
        mood INT NOT NULL,
        anxiety INT NOT NULL,
        sleep INT NOT NULL,
        medication INT NOT NULL,
        nutrition INT NOT NULL,
        exercise INT NOT NULL,
        notes TEXT NULL,
        log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )");
    $response['messages'][] = "Pain logs table setup complete";
    
} catch (PDOException $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
