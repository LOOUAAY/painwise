<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$response = ['success' => false, 'structure' => [], 'error' => null];

try {
    // First check if messages table exists
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $response['tables'] = $tables;
    
    if (in_array('messages', $tables)) {
        // Get table structure
        $columns = $pdo->query("DESCRIBE messages")->fetchAll(PDO::FETCH_ASSOC);
        $response['structure'] = $columns;
        
        // Get a sample row
        $sample = $pdo->query("SELECT * FROM messages LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        $response['sample'] = $sample;
        
        $response['success'] = true;
    } else {
        $response['error'] = 'Messages table does not exist';
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
