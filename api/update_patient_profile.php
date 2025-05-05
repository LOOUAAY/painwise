<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || empty($data['id'])) {
        throw new Exception('Patient ID is required');
    }
    
    $patient_id = intval($data['id']);
    
    // Check if patient exists
    $checkStmt = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
    $checkStmt->execute([$patient_id]);
    if (!$checkStmt->fetch()) {
        throw new Exception('Patient not found');
    }
    
    // Update patient data
    $stmt = $pdo->prepare("UPDATE patients SET 
        name = ?, 
        age = ?, 
        gender = ?, 
        phone = ?, 
        address = ? 
        WHERE id = ?");
    
    $stmt->execute([
        $data['name'] ?? '',
        $data['age'] ? intval($data['age']) : null,
        $data['gender'] ?? null,
        $data['phone'] ?? null,
        $data['address'] ?? null,
        $patient_id
    ]);
    
    $response['success'] = true;
    $response['data'] = [
        'id' => $patient_id,
        'name' => $data['name'] ?? '',
        'age' => $data['age'] ? intval($data['age']) : null,
        'gender' => $data['gender'] ?? null,
        'phone' => $data['phone'] ?? null,
        'address' => $data['address'] ?? null
    ];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
