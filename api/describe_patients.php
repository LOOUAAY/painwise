<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    // Describe the patients table to see its structure
    $stmt = $pdo->query("DESCRIBE patients");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['success'] = true;
    $response['data'] = [
        'columns' => $columns
    ];
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
