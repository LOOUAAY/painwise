<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Log the received data for debugging
    error_log("Received pain log data: " . json_encode($data));
    
    // Validate required fields - be more flexible with incoming data structure
    if (!isset($data['patient_id'])) {
        throw new Exception('Missing patient_id');
    }
    
    // Use pain_level or rating, whichever is available
    $painRating = isset($data['rating']) ? $data['rating'] : 
                 (isset($data['pain_level']) ? $data['pain_level'] : 
                 (isset($data['pain_rating']) ? $data['pain_rating'] : null));
    
    if ($painRating === null) {
        throw new Exception('Missing pain rating (rating/pain_level/pain_rating)');
    }
    
    if ($painRating < 0 || $painRating > 10) {
        throw new Exception('Pain rating must be between 0 and 10');
    }
    
    // Get pain points from different possible sources
    $location = null;
    if (isset($data['location'])) {
        $location = is_string($data['location']) ? $data['location'] : json_encode($data['location']);
    } elseif (isset($data['pain_points'])) {
        $location = is_string($data['pain_points']) ? $data['pain_points'] : json_encode($data['pain_points']);
    }
    
    // Get type of pain
    $type = isset($data['type']) ? $data['type'] : 
           (isset($data['pain_type']) ? $data['pain_type'] : 'General');
    
    // Get notes or combine from other fields
    $notes = isset($data['notes']) ? $data['notes'] : "";
    
    // Add additional data to notes if available
    if (isset($data['functionality_score'])) {
        $notes .= " | Functionality: " . $data['functionality_score'];
    }
    if (isset($data['mood_score'])) {
        $notes .= " | Mood: " . $data['mood_score'];
    }
    if (isset($data['anxiety_score'])) {
        $notes .= " | Anxiety: " . $data['anxiety_score'];
    }
    if (isset($data['sleep_score'])) {
        $notes .= " | Sleep: " . $data['sleep_score'];
    }
    
    $timestamp = isset($data['timestamp']) ? $data['timestamp'] : date('Y-m-d H:i:s');

    // Check if the pain_logs table exists and has the right structure
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'pain_logs'");
    if ($tableCheck->rowCount() == 0) {
        // Table doesn't exist, create it
        $createTable = "CREATE TABLE IF NOT EXISTS pain_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            patient_id INT NOT NULL,
            rating INT NOT NULL CHECK (rating >= 0 AND rating <= 10),
            location JSON,
            type VARCHAR(50),
            notes TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $pdo->exec($createTable);
    }
    
    // Insert data
    $query = "INSERT INTO pain_logs (patient_id, rating, location, type, notes, timestamp) 
              VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $data['patient_id'],
        $painRating,
        $location,
        $type,
        $notes,
        $timestamp
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Pain log saved successfully',
        'id' => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
