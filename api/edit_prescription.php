<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('Prescription ID is required');
    }

    $updates = [];
    $params = [];

    $allowedFields = ['name', 'dosage', 'schedule', 'start_date', 'end_date', 'notes', 'status'];
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }

    if (empty($updates)) {
        throw new Exception('No fields to update');
    }

    $params[] = $data['id'];

    $query = "UPDATE prescriptions SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);

    if ($stmt->execute($params)) {
        $response['success'] = true;
        $response['data'] = [
            'message' => 'Prescription updated successfully'
        ];
    } else {
        throw new Exception('Failed to update prescription');
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 