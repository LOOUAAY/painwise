<?php
require_once __DIR__ . '/headers.php';
require_once __DIR__ . '/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['patient_id']) || !isset($data['rating'])) {
        throw new Exception('Missing required fields');
    }

    if ($data['rating'] < 0 || $data['rating'] > 10) {
        throw new Exception('Pain rating must be between 0 and 10');
    }

    $query = "INSERT INTO pain_logs (patient_id, rating, location, type, notes, timestamp) 
              VALUES (?, ?, ?, ?, ?, ?)";
    
    $location = isset($data['location']) ? json_encode($data['location']) : null;
    $timestamp = isset($data['timestamp']) ? $data['timestamp'] : date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $data['patient_id'],
        $data['rating'],
        $location,
        $data['type'] ?? null,
        $data['notes'] ?? null,
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