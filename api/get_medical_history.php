<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;
    
    if (!$patient_id) {
        throw new Exception('Patient ID is required');
    }

    // Get medical history data
    $stmt = $pdo->prepare("SELECT id, patient_id, condition_name, diagnosed_date, notes, created_at 
                         FROM medical_history 
                         WHERE patient_id = ? 
                         ORDER BY created_at DESC");
    $stmt->execute([$patient_id]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['data'] = $history;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
