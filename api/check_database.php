<?php
// Include CORS headers for debugging via browser
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

// Get all tables
$tables = [];
try {
    $result = $pdo->query("SHOW TABLES");
    while ($row = $result->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    $structure = [];
    
    // For each table, get its structure
    foreach ($tables as $table) {
        $columns = [];
        $columnsResult = $pdo->query("DESCRIBE `{$table}`");
        while ($column = $columnsResult->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $column;
        }
        
        // Get sample data (first row)
        $sampleData = null;
        try {
            $dataResult = $pdo->query("SELECT * FROM `{$table}` LIMIT 1");
            $sampleData = $dataResult->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $sampleData = ['error' => $e->getMessage()];
        }
        
        $structure[$table] = [
            'columns' => $columns,
            'sample_data' => $sampleData
        ];
    }
    
    // Output the database structure
    echo json_encode([
        'success' => true,
        'database' => $pdo->query("SELECT DATABASE()")->fetchColumn(),
        'tables' => $tables,
        'structure' => $structure
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
