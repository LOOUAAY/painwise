<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

try {
    // Check if there are any doctors
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM doctors");
    $row = $stmt->fetch();
    
    if ($row['count'] == 0) {
        // Insert a sample doctor if none exists
        $password = password_hash('doctor123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO doctors (name, email, password, specialization) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Dr. John Smith', 'doctor@example.com', $password, 'General Medicine']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Sample doctor created successfully'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Doctors already exist'
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error creating sample doctor: ' . $e->getMessage()
    ]);
} 