<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['patient_id']) || empty($data['patient_id'])) {
        throw new Exception('Patient ID is required');
    }
    
    if (!isset($data['condition_name']) || empty($data['condition_name'])) {
        throw new Exception('Condition name is required');
    }
    
    $patient_id = intval($data['patient_id']);
    
    // Check if patient exists
    $checkStmt = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
    $checkStmt->execute([$patient_id]);
    if (!$checkStmt->fetch()) {
        throw new Exception('Patient not found');
    }
    
    // Add medical history data
    $stmt = $pdo->prepare("INSERT INTO medical_history (patient_id, condition_name, diagnosed_date, notes) 
                         VALUES (?, ?, ?, ?)");
    
    $stmt->execute([
        $patient_id,
        $data['condition_name'],
        $data['diagnosed_date'] ?? null,
        $data['notes'] ?? null
    ]);
    
    $new_id = $pdo->lastInsertId();
    
    $response['success'] = true;
    $response['data'] = [
        'id' => $new_id,
        'patient_id' => $patient_id,
        'condition_name' => $data['condition_name'],
        'diagnosed_date' => $data['diagnosed_date'] ?? null,
        'notes' => $data['notes'] ?? null,
        'created_at' => date('Y-m-d H:i:s')
    ];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
