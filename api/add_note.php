<?php
header('Content-Type: application/json');
require_once '../db.php';

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['patient_id']) || !isset($data['content']) || 
        !isset($data['created_by_type']) || !isset($data['created_by_id'])) {
        throw new Exception('Missing required fields');
    }

    if (!in_array($data['created_by_type'], ['doctor', 'patient'])) {
        throw new Exception('Invalid creator type');
    }

    $query = "INSERT INTO notes (patient_id, content, created_by_type, created_by_id) 
              VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param(
        'issi',
        $data['patient_id'],
        $data['content'],
        $data['created_by_type'],
        $data['created_by_id']
    );

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['data'] = [
            'id' => $conn->insert_id,
            'message' => 'Note added successfully'
        ];
    } else {
        throw new Exception('Failed to add note');
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 