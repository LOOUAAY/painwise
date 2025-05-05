<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$response = [
    'success' => false, 
    'table_exists' => false,
    'structure' => [],
    'sample_data' => null,
    'error' => null
];

try {
    // Check if the pain_logs table exists
    $tablesQuery = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    $response['table_exists'] = $tablesQuery->rowCount() > 0;
    
    if ($response['table_exists']) {
        // Get table structure
        $columnsQuery = $pdo->query("DESCRIBE pain_logs");
        $response['structure'] = $columnsQuery->fetchAll(PDO::FETCH_ASSOC);
        
        // Try to get a sample record
        $dataQuery = $pdo->query("SELECT * FROM pain_logs LIMIT 1");
        $response['sample_data'] = $dataQuery->fetch(PDO::FETCH_ASSOC);
        
        // Count records
        $countQuery = $pdo->query("SELECT COUNT(*) as count FROM pain_logs");
        $response['record_count'] = $countQuery->fetch(PDO::FETCH_ASSOC)['count'];
        
        $response['success'] = true;
    } else {
        $response['error'] = 'The pain_logs table does not exist';
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
