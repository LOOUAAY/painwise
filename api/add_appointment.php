<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $doctor_id = $data['doctor_id'] ?? null;
    $patient_id = $data['patient_id'] ?? null;
    $appointment_date = $data['appointment_date'] ?? null;
    $appointment_time = $data['appointment_time'] ?? null;
    $type = $data['type'] ?? null;
    $notes = $data['notes'] ?? null;
    $status = $data['status'] ?? 'pending';
    
    if (!$doctor_id || !$patient_id || !$appointment_date || !$appointment_time) {
        throw new Exception('Missing required fields');
    }
    
    // Combine date and time into datetime format
    $datetime = $appointment_date . ' ' . $appointment_time . ':00';

    // Insert with the correct datetime column
    $stmt = $pdo->prepare('INSERT INTO appointments (doctor_id, patient_id, datetime, type, notes, status) VALUES (?, ?, ?, ?, ?, ?)');
    
    if ($stmt->execute([$doctor_id, $patient_id, $datetime, $type, $notes, $status])) {
        $id = $pdo->lastInsertId();
        
        $response['success'] = true;
        $response['data'] = [
            'id' => $id,
            'appointment_date' => $appointment_date,
            'appointment_time' => $appointment_time,
            'datetime' => $datetime
        ];
    } else {
        throw new Exception('Failed to add appointment');
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);