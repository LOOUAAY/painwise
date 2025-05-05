<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

try {
    // Check if the doctors table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'doctors'");
    if ($tableCheck->rowCount() == 0) {
        // Create the doctors table if it doesn't exist
        $createTable = "CREATE TABLE IF NOT EXISTS doctors (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            specialization VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $pdo->exec($createTable);
        echo "Created doctors table.<br>";
    }

    // Check if sample doctor already exists
    $checkDoctor = $pdo->prepare("SELECT * FROM doctors WHERE email = ?");
    $checkDoctor->execute(['dr.smith@example.com']);
    
    if ($checkDoctor->rowCount() == 0) {
        // Add a sample doctor
        $password = password_hash('password123', PASSWORD_DEFAULT);
        $insertDoctor = $pdo->prepare("INSERT INTO doctors (name, email, password, specialization) VALUES (?, ?, ?, ?)");
        $insertDoctor->execute(['Dr. Smith', 'dr.smith@example.com', $password, 'Pain Management']);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Sample doctor added successfully',
            'doctor_id' => $pdo->lastInsertId()
        ]);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => 'Sample doctor already exists'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Error adding sample doctor: ' . $e->getMessage()
    ]);
}
?>
