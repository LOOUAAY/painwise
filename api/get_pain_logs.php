<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;
    
    if (!$patient_id) {
        throw new Exception('Patient ID is required');
    }

    // Check if table exists first
    $checkTable = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    if ($checkTable->rowCount() == 0) {
        throw new Exception('Pain logs table does not exist');
    }

    // Check table structure to determine column names
    $columns = $pdo->query("DESCRIBE pain_logs")->fetchAll(PDO::FETCH_COLUMN);
    
    // Build the query based on available columns
    $hasPatientIdColumn = in_array('patient_id', $columns);
    $hasTimestampColumn = in_array('timestamp', $columns) || in_array('created_at', $columns);
    $timestampColumn = in_array('timestamp', $columns) ? 'timestamp' : 'created_at';
    
    if (!$hasPatientIdColumn) {
        throw new Exception('Pain logs table does not have patient_id column');
    }
    
    // Get all columns for the SELECT statement
    $selectColumns = implode(', ', $columns);
    
    // Sort by timestamp if available, otherwise by ID
    $orderClause = $hasTimestampColumn ? "ORDER BY {$timestampColumn} DESC" : "ORDER BY id DESC";
    
    $query = "SELECT {$selectColumns} FROM pain_logs WHERE patient_id = ? {$orderClause}";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$patient_id]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process JSON fields if they exist
    $jsonFields = ['location', 'pain_points', 'triggers', 'nutrition', 'sleep', 'medication', 'stress'];
    
    foreach ($logs as &$row) {
        foreach ($jsonFields as $field) {
            if (isset($row[$field]) && !empty($row[$field])) {
                try {
                    $decodedValue = json_decode($row[$field], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $row[$field] = $decodedValue;
                    }
                } catch (Exception $e) {
                    // If there's an error decoding, leave as is
                }
            }
        }
        
        // Add default empty arrays for fields that might be expected by frontend
        if (!isset($row['pain_points']) || empty($row['pain_points'])) {
            $row['pain_points'] = [];
        }
        
        // Ensure created_at or timestamp is present for sorting in frontend
        if (!isset($row['created_at']) && isset($row[$timestampColumn])) {
            $row['created_at'] = $row[$timestampColumn];
        }
    }

    $response['success'] = true;
    $response['data'] = $logs;
    $response['count'] = count($logs);
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    $response['query'] = isset($query) ? $query : null;
}

echo json_encode($response, JSON_PARTIAL_OUTPUT_ON_ERROR);