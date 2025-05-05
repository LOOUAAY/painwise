<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Check if the pain_logs table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    $tableExists = $tableCheck->rowCount() > 0;
    
    $response = [
        'table_exists' => $tableExists,
        'columns' => [],
        'message' => $tableExists ? 'Table exists' : 'Table does not exist',
    ];
    
    if ($tableExists) {
        // Get detailed column information
        $stmt = $pdo->query("SHOW COLUMNS FROM pain_logs");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response['columns'] = $columns;
        
        // Try to get one sample record
        $sampleQuery = $pdo->query("SELECT * FROM pain_logs LIMIT 1");
        if ($sampleQuery->rowCount() > 0) {
            $response['sample_record'] = $sampleQuery->fetch(PDO::FETCH_ASSOC);
        }
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
