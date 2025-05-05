<?php
// Include common headers that handle CORS correctly
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');

// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
require_once __DIR__ . '/db.php';

// Get patient ID from query parameter
$patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;

// Initialize response array
$response = [
    'success' => false,
    'error' => null,
    'data' => null,
    'debug_info' => []
];

try {
    // Add debug info
    $response['debug_info']['request_time'] = date('Y-m-d H:i:s');
    $response['debug_info']['patient_id'] = $patient_id;
    
    if (!$patient_id) {
        throw new Exception('Patient ID is required');
    }
    
    // Check if table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    if ($tableCheck->rowCount() == 0) {
        throw new Exception('Pain logs table does not exist');
    }
    
    // Get table structure
    $columns = [];
    $columnResults = $pdo->query("DESCRIBE pain_logs");
    while ($column = $columnResults->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $column['Field'];
    }
    
    $response['debug_info']['table_columns'] = $columns;
    
    // Get all pain logs for this patient
    $query = "SELECT * FROM pain_logs WHERE patient_id = ? ORDER BY id DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$patient_id]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['debug_info']['raw_logs_count'] = count($logs);
    
    // Process the logs
    $processedLogs = [];
    foreach ($logs as $log) {
        // Add raw log for debugging
        $processedLog = $log;
        
        // Process JSON fields
        $jsonFields = ['pain_points', 'location', 'medication', 'nutrition', 'exercise'];
        foreach ($jsonFields as $field) {
            if (isset($log[$field]) && !empty($log[$field]) && is_string($log[$field])) {
                try {
                    $decodedValue = json_decode($log[$field], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $processedLog[$field] = $decodedValue;
                    }
                } catch (Exception $e) {
                    // Keep as is if can't decode
                }
            }
        }
        
        // Add standardized fields for frontend compatibility
        if (isset($log['pain_level']) && !isset($processedLog['rating'])) {
            $processedLog['rating'] = $log['pain_level'];
        }
        
        if (isset($log['log_time']) && !isset($processedLog['timestamp'])) {
            $processedLog['timestamp'] = $log['log_time'];
        }
        
        if (isset($log['log_time']) && !isset($processedLog['created_at'])) {
            $processedLog['created_at'] = $log['log_time'];
        }
        
        $processedLogs[] = $processedLog;
    }
    
    // Set success response
    $response['success'] = true;
    $response['data'] = $processedLogs;
    $response['count'] = count($processedLogs);
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    $response['debug_info']['error_details'] = $e->getTraceAsString();
}

// Output JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
?>
