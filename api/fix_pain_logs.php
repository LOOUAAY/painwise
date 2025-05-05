<?php
header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Check if pain_logs table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    $tableExists = $tableCheck->rowCount() > 0;
    
    $response = ['success' => true];
    
    if (!$tableExists) {
        // Create the table with the right structure
        $createTableSql = "CREATE TABLE pain_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            pain_level INT NOT NULL,
            pain_points TEXT,
            functionality_score FLOAT,
            mood_score FLOAT,
            anxiety_score FLOAT,
            sleep_score FLOAT,
            medication TEXT,
            nutrition TEXT,
            exercise TEXT,
            notes TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        
        $pdo->exec($createTableSql);
        $response['message'] = 'Table created successfully';
    } else {
        // Table exists, check its structure
        $columns = [];
        $columnResults = $pdo->query("DESCRIBE pain_logs");
        while ($column = $columnResults->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $column['Field'];
        }
        
        $response['existing_columns'] = $columns;
        
        // Check if rating column exists, if not, add pain_level
        if (!in_array('pain_level', $columns) && !in_array('rating', $columns)) {
            $pdo->exec("ALTER TABLE pain_logs ADD COLUMN pain_level INT NOT NULL AFTER patient_id");
            $response['added_column'] = 'pain_level';
        }
        
        // Make sure other essential columns exist
        $essentialColumns = [
            'pain_points' => 'TEXT',
            'functionality_score' => 'FLOAT',
            'mood_score' => 'FLOAT',
            'anxiety_score' => 'FLOAT',
            'sleep_score' => 'FLOAT',
            'medication' => 'TEXT',
            'nutrition' => 'TEXT',
            'exercise' => 'TEXT',
            'notes' => 'TEXT'
        ];
        
        foreach ($essentialColumns as $column => $type) {
            if (!in_array($column, $columns)) {
                $pdo->exec("ALTER TABLE pain_logs ADD COLUMN $column $type");
                $response['added_columns'][] = $column;
            }
        }
        
        // Get the updated structure
        $updatedColumns = [];
        $updatedResults = $pdo->query("DESCRIBE pain_logs");
        while ($column = $updatedResults->fetch(PDO::FETCH_ASSOC)) {
            $updatedColumns[] = $column['Field'];
        }
        
        $response['updated_columns'] = $updatedColumns;
        $response['message'] = 'Table structure verified and updated if needed';
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
