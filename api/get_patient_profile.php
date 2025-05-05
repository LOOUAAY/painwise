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

    // Get patient data
    $stmt = $pdo->prepare("SELECT id, name, email, age, gender, phone, address FROM patients WHERE id = ?");
    $stmt->execute([$patient_id]);
    $patient = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$patient) {
        throw new Exception('Patient not found');
    }

    $response['success'] = true;
    $response['data'] = $patient;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
