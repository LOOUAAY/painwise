<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

// Get all appointments for a doctor
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['doctor_id'])) {
    $doctor_id = $_GET['doctor_id'];
    $stmt = $pdo->prepare('
        SELECT a.*, p.name as patient_name, p.email as patient_email 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        WHERE a.doctor_id = ? 
        ORDER BY a.datetime DESC
    ');
    $stmt->execute([$doctor_id]);
    echo json_encode(['success' => true, 'appointments' => $stmt->fetchAll()]);
    exit;
}

// Get all appointments for a patient
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['patient_id'])) {
    $patient_id = $_GET['patient_id'];
    $stmt = $pdo->prepare('
        SELECT a.*, d.name as doctor_name, d.email as doctor_email 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id 
        WHERE a.patient_id = ? 
        ORDER BY a.datetime DESC
    ');
    $stmt->execute([$patient_id]);
    echo json_encode(['success' => true, 'appointments' => $stmt->fetchAll()]);
    exit;
}

// Create new appointment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['doctor_id']) || !isset($data['patient_id']) || !isset($data['datetime'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $stmt = $pdo->prepare('
        INSERT INTO appointments (doctor_id, patient_id, datetime, type, notes) 
        VALUES (?, ?, ?, ?, ?)
    ');
    
    if ($stmt->execute([
        $data['doctor_id'],
        $data['patient_id'],
        $data['datetime'],
        $data['type'] ?? null,
        $data['notes'] ?? null
    ])) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to create appointment']);
    }
    exit;
}

// Update appointment
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['datetime'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $stmt = $pdo->prepare('
        UPDATE appointments 
        SET datetime = ?, 
            type = ?, 
            notes = ?,
            status = ?,
            reminder_time = ?,
            reminder_sent = CASE 
                WHEN status != ? THEN FALSE 
                ELSE reminder_sent 
            END
        WHERE id = ?
    ');
    
    if ($stmt->execute([
        $data['datetime'],
        $data['type'] ?? null,
        $data['notes'] ?? null,
        $data['status'] ?? 'pending',
        $data['reminder_time'] ?? null,
        $data['status'] ?? 'pending',
        $data['id']
    ])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update appointment']);
    }
    exit;
}

// Delete appointment
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Missing appointment ID']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM appointments WHERE id = ?');
    
    if ($stmt->execute([$data['id']])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to delete appointment']);
    }
    exit;
}

// If no valid endpoint is matched
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Invalid endpoint']); 