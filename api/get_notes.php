<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;
    
    if (!$patient_id) {
        throw new Exception('Patient ID is required');
    }

    $query = "SELECT n.*, 
                     CASE 
                         WHEN n.created_by_type = 'doctor' THEN d.name
                         WHEN n.created_by_type = 'patient' THEN p.name
                     END as author_name
              FROM notes n
              LEFT JOIN doctors d ON n.created_by_type = 'doctor' AND n.created_by_id = d.id
              LEFT JOIN patients p ON n.created_by_type = 'patient' AND n.created_by_id = p.id
              WHERE n.patient_id = ?
              ORDER BY n.created_at DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$patient_id]);
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['data'] = $notes;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 