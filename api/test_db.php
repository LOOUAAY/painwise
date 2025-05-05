<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    // Test database connection
    $response = [
        'status' => 'success',
        'message' => 'Database connection successful',
        'database_info' => [
            'name' => $db,
            'host' => $host,
            'charset' => $charset
        ]
    ];
    
    // Try to get database version
    $stmt = $pdo->query('SELECT VERSION()');
    $response['database_version'] = $stmt->fetchColumn();
    
    echo json_encode($response);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
} 