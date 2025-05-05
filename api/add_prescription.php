<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required fields
    $requiredFields = ['patient_id', 'name', 'dosage']; 
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
    }

    // Handle adding or updating a prescription
    if (isset($data['id']) && !empty($data['id'])) {
        // This is an update of an existing prescription
        $query = "UPDATE prescriptions SET 
                patient_id = ?, 
                name = ?, 
                dosage = ?,
                time = ?,
                schedule = ?,
                doctor_id = ?,
                start_date = ?,
                end_date = ?,
                notes = ?,
                status = ?
                WHERE id = ?"; 
        
        $params = [
            $data['patient_id'],
            $data['name'],
            $data['dosage'],
            $data['schedule'] ?? '', // Store in time column for backward compatibility 
            $data['schedule'] ?? '',
            $data['doctor_id'] ?? 0,
            $data['start_date'] ?? date('Y-m-d'),
            $data['end_date'] ?? null,
            $data['notes'] ?? null,
            $data['status'] ?? 'active',
            $data['id']
        ];
    } else {
        // This is a new prescription
        $query = "INSERT INTO prescriptions 
                (patient_id, name, dosage, time, schedule, doctor_id, start_date, end_date, notes, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";  
        
        $params = [
            $data['patient_id'],
            $data['name'],
            $data['dosage'],
            $data['schedule'] ?? '', // Store in time column for backward compatibility
            $data['schedule'] ?? '',
            $data['doctor_id'] ?? 0,
            $data['start_date'] ?? date('Y-m-d'),
            $data['end_date'] ?? null,
            $data['notes'] ?? null,
            $data['status'] ?? 'active'
        ];
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    if ($stmt) {
        $response['success'] = true;
        $response['data'] = [
            'id' => $pdo->lastInsertId(),
            'message' => 'Prescription added successfully'
        ];
    } else {
        throw new Exception('Failed to add prescription');
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 