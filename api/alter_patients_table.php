<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null, 'messages' => []];

try {
    // Check if columns exist before trying to add them
    $existingColumns = [];
    $columnsToAdd = ['age', 'gender', 'phone', 'address', 'created_at'];
    
    $stmt = $pdo->query("DESCRIBE patients");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        $existingColumns[] = $column['Field'];
    }
    
    $response['data']['existing_columns'] = $existingColumns;
    
    // Add each missing column
    foreach ($columnsToAdd as $column) {
        if (!in_array($column, $existingColumns)) {
            try {
                $sql = '';
                switch ($column) {
                    case 'age':
                        $sql = "ALTER TABLE patients ADD COLUMN age INT NULL";
                        break;
                    case 'gender':
                        $sql = "ALTER TABLE patients ADD COLUMN gender VARCHAR(50) NULL";
                        break;
                    case 'phone':
                        $sql = "ALTER TABLE patients ADD COLUMN phone VARCHAR(50) NULL";
                        break;
                    case 'address':
                        $sql = "ALTER TABLE patients ADD COLUMN address TEXT NULL";
                        break;
                    case 'created_at':
                        $sql = "ALTER TABLE patients ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
                        break;
                }
                
                if ($sql) {
                    $pdo->exec($sql);
                    $response['messages'][] = "Added column: $column";
                }
            } catch (Exception $e) {
                $response['messages'][] = "Error adding $column: " . $e->getMessage();
            }
        } else {
            $response['messages'][] = "Column already exists: $column";
        }
    }
    
    $response['success'] = true;
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
