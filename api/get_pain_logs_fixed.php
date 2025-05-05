<?php
// Include common headers that handle CORS correctly
require_once __DIR__ . '/headers.php';

// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database connection
require_once __DIR__ . '/db.php';

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;
    
    if (!$patient_id) {
        throw new Exception('Patient ID is required');
    }

    // Log the request for debugging
    error_log("Fetching pain logs for patient ID: " . $patient_id);

    // Check if table exists first
    $checkTable = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    if ($checkTable->rowCount() == 0) {
        throw new Exception('Pain logs table does not exist');
    }

    // Get the actual table structure
    $columns = [];
    $columnResults = $pdo->query("DESCRIBE pain_logs");
    while ($column = $columnResults->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $column['Field'];
    }
    
    // Log the actual columns for debugging
    error_log("Found pain_logs columns: " . implode(", ", $columns));
    
    // Build the query based on available columns
    $hasPatientIdColumn = in_array('patient_id', $columns);
    
    // Determine timestamp column (might be log_time, created_at, or timestamp)
    $timeColumn = null;
    foreach (['log_time', 'created_at', 'timestamp'] as $possibleColumn) {
        if (in_array($possibleColumn, $columns)) {
            $timeColumn = $possibleColumn;
            break;
        }
    }
    
    if (!$hasPatientIdColumn) {
        throw new Exception('Pain logs table does not have patient_id column');
    }
    
    // Get all columns for the SELECT statement
    $selectColumns = implode(', ', $columns);
    
    // Sort by timestamp if available, otherwise by ID
    $orderClause = $timeColumn ? "ORDER BY {$timeColumn} DESC" : "ORDER BY id DESC";
    
    $query = "SELECT {$selectColumns} FROM pain_logs WHERE patient_id = ? {$orderClause}";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$patient_id]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Log the count of records found
    error_log("Found " . count($logs) . " pain logs for patient ID: " . $patient_id);
    
    // Process JSON fields if they exist
    $jsonFields = ['pain_points', 'location', 'triggers', 'nutrition', 'medication', 'exercise'];
    
    foreach ($logs as &$log) {
        // Log the raw record for debugging
        error_log("Processing log ID " . ($log['id'] ?? 'unknown') . ": " . json_encode($log));
        
        // Make sure both old and new field names are available for compatibility
        
        // Handle pain level (might be pain_level or rating)
        if (isset($log['pain_level']) && !isset($log['rating'])) {
            $log['rating'] = $log['pain_level'];
        } else if (isset($log['rating']) && !isset($log['pain_level'])) {
            $log['pain_level'] = $log['rating'];
        }
        
        // Ensure timestamp fields exist in expected formats
        if ($timeColumn) {
            if (!isset($log['timestamp'])) {
                $log['timestamp'] = $log[$timeColumn];
            }
            if (!isset($log['created_at'])) {
                $log['created_at'] = $log[$timeColumn];
            }
            if (!isset($log['log_time'])) {
                $log['log_time'] = $log[$timeColumn];
            }
        }
        
        // Process potential JSON fields
        foreach ($jsonFields as $field) {
            if (isset($log[$field]) && !empty($log[$field]) && is_string($log[$field])) {
                try {
                    $decodedValue = json_decode($log[$field], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $log[$field] = $decodedValue;
                    }
                } catch (Exception $e) {
                    error_log("Error decoding JSON for field $field: " . $e->getMessage());
                }
            }
        }
        
        // Ensure pain_points exists and is processed correctly
        if (!isset($log['pain_points']) && isset($log['location'])) {
            $log['pain_points'] = $log['location'];
        }
        
        // Ensure both location and pain_points exist as arrays
        if (!isset($log['pain_points']) || empty($log['pain_points'])) {
            $log['pain_points'] = [];
        }
        if (!isset($log['location']) || empty($log['location'])) {
            $log['location'] = $log['pain_points'];
        }
    }

    $response['success'] = true;
    $response['data'] = $logs;
    $response['count'] = count($logs);
    $response['columns'] = $columns; // Include actual columns for debugging
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    $response['query'] = isset($query) ? $query : null;
    error_log("Error in get_pain_logs_fixed.php: " . $e->getMessage());
}

echo json_encode($response, JSON_PARTIAL_OUTPUT_ON_ERROR);
?>
