<?php
// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include common headers that handle CORS correctly
require_once __DIR__ . '/cors.php';

// Include database connection
require_once __DIR__ . '/db.php';

try {
    // Check if the doctors table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'doctors'");
    if ($tableCheck->rowCount() == 0) {
        throw new Exception('Doctors table does not exist');
    }
    
    // Get all doctors with the correct column names
    $stmt = $pdo->query('SELECT id, name, email, specialty FROM doctors');
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $doctors,
        'count' => count($doctors)
    ]);
} catch (Exception $e) {
    // Log the error for server-side debugging
    error_log('Error in get_doctors.php: ' . $e->getMessage());
    
    // Return a 500 error with details
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch doctors: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}