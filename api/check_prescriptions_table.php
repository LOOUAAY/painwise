<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    // Get the table structure
    $columnsResult = $pdo->query("SHOW COLUMNS FROM prescriptions");
    $columns = [];
    
    while ($column = $columnsResult->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $column;
    }
    
    // Get table create statement
    $tableInfo = $pdo->query("SHOW CREATE TABLE prescriptions");
    $createTableStatement = $tableInfo->fetch(PDO::FETCH_ASSOC);
    
    $response['success'] = true;
    $response['data'] = [
        'columns' => $columns,
        'create_statement' => $createTableStatement['Create Table'] ?? null
    ];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
