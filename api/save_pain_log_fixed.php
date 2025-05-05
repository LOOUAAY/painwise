<?php
// Include common headers that handle CORS correctly
require_once __DIR__ . '/headers.php';

// Include database connection
require_once __DIR__ . '/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Log the received data for debugging
    error_log("Received pain log data: " . json_encode($data));
    
    // Validate required fields
    if (!isset($data['patient_id'])) {
        throw new Exception('Missing patient_id');
    }
    
    // Get pain level value from any of the possible field names
    $painLevel = isset($data['pain_level']) ? $data['pain_level'] : 
                (isset($data['pain_rating']) ? $data['pain_rating'] : 
                (isset($data['rating']) ? $data['rating'] : 5)); // Default to 5 if not specified
    
    // Handle pain points data
    $painPoints = isset($data['pain_points']) ? $data['pain_points'] : 
                 (isset($data['location']) ? $data['location'] : null);
    
    // Convert to JSON string if it's not already
    if ($painPoints !== null && !is_string($painPoints)) {
        $painPoints = json_encode($painPoints);
    }
    
    // Get other scores
    $functionality = isset($data['functionality_score']) ? $data['functionality_score'] : 
                    (isset($data['functionality']) ? $data['functionality'] : 0);
    
    $mood = isset($data['mood_score']) ? $data['mood_score'] : 
          (isset($data['mood']) ? $data['mood'] : 0);
    
    $anxiety = isset($data['anxiety_score']) ? $data['anxiety_score'] : 
             (isset($data['anxiety']) ? $data['anxiety'] : 0);
    
    $sleep = isset($data['sleep_score']) ? $data['sleep_score'] : 
           (isset($data['sleep']) ? $data['sleep'] : 0);
    
    // Handle medication, nutrition, exercise
    $medication = isset($data['medication']) ? $data['medication'] : null;
    if ($medication !== null && !is_string($medication)) {
        $medication = json_encode($medication);
    }
    
    $nutrition = isset($data['nutrition']) ? $data['nutrition'] : null;
    if ($nutrition !== null && !is_string($nutrition)) {
        $nutrition = json_encode($nutrition);
    }
    
    $exercise = isset($data['exercise']) ? $data['exercise'] : null;
    if ($exercise !== null && !is_string($exercise)) {
        $exercise = json_encode($exercise);
    }
    
    // Notes field
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    // Get timestamp/log_time
    $logTime = isset($data['timestamp']) ? $data['timestamp'] : 
             (isset($data['log_time']) ? $data['log_time'] : date('Y-m-d H:i:s'));
    
    // Prepare SQL using the column names from your actual database
    $query = "INSERT INTO pain_logs (
                patient_id, 
                pain_level, 
                pain_points, 
                functionality, 
                mood, 
                anxiety, 
                sleep, 
                medication, 
                nutrition, 
                exercise, 
                log_time
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $data['patient_id'],
        $painLevel,
        $painPoints,
        $functionality,
        $mood,
        $anxiety,
        $sleep,
        $medication,
        $nutrition,
        $exercise,
        $logTime
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
