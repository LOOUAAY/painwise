<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['sender_id']) || !isset($data['sender_type']) || 
        !isset($data['recipient_id']) || !isset($data['recipient_type']) || 
        !isset($data['content'])) {
        throw new Exception('Missing required fields');
    }

    if (!in_array($data['sender_type'], ['doctor', 'patient']) || 
        !in_array($data['recipient_type'], ['doctor', 'patient'])) {
        throw new Exception('Invalid sender or recipient type');
    }
    
    // Adapt the data to match our actual database structure
    $doctor_id = ($data['sender_type'] === 'doctor') ? $data['sender_id'] : $data['recipient_id'];
    $patient_id = ($data['sender_type'] === 'patient') ? $data['sender_id'] : $data['recipient_id'];
    $sender = $data['sender_type']; // This should be either 'doctor' or 'patient'
    
    // Prepare and execute insert
    $query = "INSERT INTO messages (doctor_id, patient_id, sender, content) 
              VALUES (:doctor_id, :patient_id, :sender, :content)";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':doctor_id' => $doctor_id,
        ':patient_id' => $patient_id,
        ':sender' => $sender,
        ':content' => $data['content']
    ]);

    if ($stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['data'] = [
            'id' => $pdo->lastInsertId(),
            'message' => 'Message sent successfully'
        ];
    } else {
        throw new Exception('Failed to send message');
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);