<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$response = ['success' => false, 'message' => '', 'errors' => []];

try {
    // Check if messages table exists
    $checkTable = $pdo->query("SHOW TABLES LIKE 'messages'");
    $tableExists = $checkTable->rowCount() > 0;
    
    if (!$tableExists) {
        // Create the messages table
        $pdo->exec("CREATE TABLE messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            sender_type VARCHAR(20) NOT NULL,
            recipient_id INT NOT NULL,
            recipient_type VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
        $response['message'] .= "Messages table created successfully. ";
    } else {
        // Check if required columns exist
        $result = $pdo->query("DESCRIBE messages");
        $columns = $result->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = [
            'id', 'sender_id', 'sender_type', 'recipient_id', 
            'recipient_type', 'content', 'is_read', 'created_at'
        ];
        
        $missingColumns = array_diff($requiredColumns, $columns);
        
        if (!empty($missingColumns)) {
            // Add missing columns
            foreach ($missingColumns as $column) {
                switch ($column) {
                    case 'sender_type':
                    case 'recipient_type':
                        $pdo->exec("ALTER TABLE messages ADD COLUMN $column VARCHAR(20) NOT NULL AFTER sender_id");
                        break;
                    case 'is_read':
                        $pdo->exec("ALTER TABLE messages ADD COLUMN $column TINYINT(1) DEFAULT 0 AFTER content");
                        break;
                    case 'created_at':
                        $pdo->exec("ALTER TABLE messages ADD COLUMN $column TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
                        break;
                    case 'updated_at':
                        $pdo->exec("ALTER TABLE messages ADD COLUMN $column TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                        break;
                    default:
                        // Skip columns that might have different data types
                        break;
                }
            }
            $response['message'] .= "Added missing columns: " . implode(', ', $missingColumns) . ". ";
        } else {
            $response['message'] .= "Messages table already has all required columns. ";
        }
    }
    
    // Now update get_messages.php file to use the correct table structure
    $getMessagesFile = __DIR__ . '/get_messages.php';
    if (file_exists($getMessagesFile)) {
        $code = file_get_contents($getMessagesFile);
        
        // Simplified query that will work with our table structure
        $newQuery = "SELECT m.*,
                     DATE_FORMAT(m.created_at, '%h:%i %p') as time,
                     DATE_FORMAT(m.created_at, '%M %d, %Y') as date
              FROM messages m
              WHERE (m.sender_id = :sender_id1 AND m.recipient_id = :recipient_id1)
                 OR (m.sender_id = :recipient_id2 AND m.recipient_id = :sender_id2)
              ORDER BY m.created_at ASC";
              
        if (strpos($code, 'LEFT JOIN doctors') !== false) {
            $pattern = '/\$query\s*=\s*"SELECT.*?ORDER BY m\.created_at ASC"/s';
            $updatedCode = preg_replace($pattern, "\$query = \"$newQuery\"", $code);
            file_put_contents($getMessagesFile, $updatedCode);
            $response['message'] .= "Updated get_messages.php query. ";
        }
    }
    
    $response['success'] = true;
} catch (Exception $e) {
    $response['success'] = false;
    $response['errors'][] = $e->getMessage();
}

echo json_encode($response);
?>
