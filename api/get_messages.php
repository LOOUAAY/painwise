<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $doctor_id = isset($_GET['sender_id']) ? intval($_GET['sender_id']) : null;
    $patient_id = isset($_GET['recipient_id']) ? intval($_GET['recipient_id']) : null;
    
    if (!$doctor_id || !$patient_id) {
        throw new Exception('Both doctor and patient IDs are required');
    }

    // Get messages between the doctor and patient using the actual database structure
    $query = "SELECT 
                m.id,
                CASE WHEN m.sender = 'doctor' THEN m.doctor_id ELSE m.patient_id END as sender_id,
                m.sender as sender_type,
                CASE WHEN m.sender = 'doctor' THEN m.patient_id ELSE m.doctor_id END as recipient_id,
                CASE WHEN m.sender = 'doctor' THEN 'patient' ELSE 'doctor' END as recipient_type,
                m.content,
                m.timestamp as created_at,
                CASE WHEN m.sender = 'doctor' THEN d.name ELSE p.name END as sender_name,
                DATE_FORMAT(m.timestamp, '%h:%i %p') as time,
                DATE_FORMAT(m.timestamp, '%M %d, %Y') as date
              FROM messages m
              LEFT JOIN doctors d ON m.doctor_id = d.id
              LEFT JOIN patients p ON m.patient_id = p.id
              WHERE (m.doctor_id = :doctor_id AND m.patient_id = :patient_id)
              OR (m.doctor_id = :patient_id AND m.patient_id = :doctor_id)
              ORDER BY m.timestamp ASC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':doctor_id' => $doctor_id,
        ':patient_id' => $patient_id
    ]);
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Note: Your messages table doesn't have a is_read column based on the structure check
    // If you want to implement read status tracking, you'd need to add this column
    // For now, we'll skip the update query

    $response['success'] = true;
    $response['data'] = $messages;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 