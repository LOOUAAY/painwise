<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$doctor_id = $_GET['doctor_id'] ?? null;
if (!$doctor_id) {
    echo json_encode(['error' => 'Missing doctor_id']);
    exit;
}

$stmt = $pdo->prepare('
    SELECT p.id, p.name, p.email
    FROM patients p
    JOIN doctor_patient dp ON p.id = dp.patient_id
    WHERE dp.doctor_id = ?
');
$stmt->execute([$doctor_id]);
$patients = $stmt->fetchAll();

echo json_encode($patients); 