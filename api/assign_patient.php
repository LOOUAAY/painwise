<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) { http_response_code(400); echo json_encode(['error' => 'Invalid input']); exit; }

$doctor_id = $data['doctor_id'];
$patient_id = $data['patient_id'];

$stmt = $pdo->prepare('INSERT IGNORE INTO doctor_patient (doctor_id, patient_id) VALUES (?, ?)');
try {
    $stmt->execute([$doctor_id, $patient_id]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>