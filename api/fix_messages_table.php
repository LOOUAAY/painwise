<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'messages' => [], 'debug' => []];

try {
    // Check if the messages table exists
    $tableResult = $pdo->query("SHOW TABLES LIKE 'messages'");
    $tableExists = $tableResult->rowCount() > 0;

    // Debug information
    $response['debug']['table_exists'] = $tableExists;
    
    // Check the schema of the existing table
    $correctSchema = false;
    if ($tableExists) {
        // Check if it has the expected structure
        try {
            $columns = $pdo->query("DESCRIBE messages")->fetchAll(PDO::FETCH_ASSOC);
            $hasRequiredColumns = false;
            $columnNames = array_map(function($col) { return $col['Field']; }, $columns);
            
            $requiredColumns = ['doctor_id', 'patient_id', 'sender', 'content', 'timestamp'];
            $hasRequiredColumns = count(array_intersect($requiredColumns, $columnNames)) === count($requiredColumns);
            
            $response['debug']['columns'] = $columnNames;
            $response['debug']['has_required_columns'] = $hasRequiredColumns;
            
            if ($hasRequiredColumns) {
                $correctSchema = true;
                $response['messages'][] = "Messages table already has the correct structure";
            }
        } catch (Exception $e) {
            $response['debug']['schema_check_error'] = $e->getMessage();
        }
        
        // Drop the table if it doesn't have the correct structure
        if (!$correctSchema) {
            $pdo->exec("DROP TABLE IF EXISTS messages");
            $response['messages'][] = "Dropped existing messages table with incorrect structure";
        }
    }
    
    // Create the messages table with the correct structure
    $query = "CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        patient_id INT NOT NULL,
        sender ENUM('doctor', 'patient') NOT NULL,
        content TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )";
    
    $pdo->exec($query);
    $response['messages'][] = "Created messages table with the correct structure";
    
    // Add an index for faster querying
    $pdo->exec("CREATE INDEX idx_messages_doctor_patient ON messages (doctor_id, patient_id)");
    $response['messages'][] = "Created index on doctor_id and patient_id";
    
    // Add some sample messages if needed for testing
    $sampleMessages = [
        [1, 1, 'doctor', 'Hello, how are you feeling today?'],
        [1, 1, 'patient', 'I\'m feeling much better, thank you!'],
        [1, 1, 'doctor', 'That\'s great to hear! Remember to take your medications.'],
        [1, 1, 'patient', 'Yes, I\'ve been following the prescription schedule.']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO messages (doctor_id, patient_id, sender, content) VALUES (?, ?, ?, ?)");
    foreach ($sampleMessages as $msg) {
        $stmt->execute($msg);
    }
    $response['messages'][] = "Added sample messages for testing";
    
    $response['success'] = true;
} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
