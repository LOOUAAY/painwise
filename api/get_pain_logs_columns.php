<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    // Get column names only
    $stmt = $pdo->query("SHOW COLUMNS FROM pain_logs");
    $columns = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $row['Field'];
    }
    
    echo json_encode(['columns' => $columns]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
