<?php
// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include common headers that handle CORS correctly
require_once __DIR__ . '/headers.php';

// Include database connection
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $pdo->exec($createTable);
        echo json_encode(['success' => true, 'message' => 'Created doctors table']);
    } else {
        // Get the current table structure
        $columns = [];
        $columnResults = $pdo->query("DESCRIBE doctors");
        while ($column = $columnResults->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $column['Field'];
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Doctors table exists',
            'columns' => $columns
        ]);
        
        // Add a sample doctor if none exists
        $checkDoctor = $pdo->query("SELECT COUNT(*) FROM doctors");
        $doctorCount = $checkDoctor->fetchColumn();
        
        if ($doctorCount == 0) {
            // Add a sample doctor
            $password = password_hash('password123', PASSWORD_DEFAULT);
            $insertDoctor = $pdo->prepare("INSERT INTO doctors (name, email, password) VALUES (?, ?, ?)");
            $insertDoctor->execute(['Dr. Smith', 'dr.smith@example.com', $password]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Sample doctor added successfully',
                'doctor_id' => $pdo->lastInsertId()
            ]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Database error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
