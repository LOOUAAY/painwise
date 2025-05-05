<?php
header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/db.php';

try {
    // Check if table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    if ($tableCheck->rowCount() == 0) {
        echo json_encode(['error' => 'pain_logs table does not exist']);
        exit;
    }
    
    // Get column information
    $columns = [];
    $columnsResult = $pdo->query("DESCRIBE pain_logs");
    while ($column = $columnsResult->fetch(PDO::FETCH_ASSOC)) {
        $columns[] = $column;
    }
    
    // Get sample data if available
    $sample = null;
    $sampleResult = $pdo->query("SELECT * FROM pain_logs LIMIT 1");
    if ($sampleResult->rowCount() > 0) {
        $sample = $sampleResult->fetch(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'columns' => $columns,
        'sample' => $sample,
        'column_names' => array_column($columns, 'Field')
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
