<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;
    
    if (!$patient_id) {
        throw new Exception('Patient ID is required');
    }

    // First check if the doctor_id column exists in the prescriptions table
    $tableCheck = $pdo->query("SHOW COLUMNS FROM prescriptions LIKE 'doctor_id'");
    $hasDoctorid = $tableCheck->rowCount() > 0;
    
    // Build the query based on the table structure
    if ($hasDoctorid) {
        $query = "SELECT p.*, d.name as doctor_name 
                FROM prescriptions p 
                LEFT JOIN doctors d ON p.doctor_id = d.id 
                WHERE p.patient_id = ? 
                ORDER BY p.created_at DESC";
    } else {
        // Fallback if doctor_id doesn't exist (older schema)
        $query = "SELECT p.* FROM prescriptions p 
                WHERE p.patient_id = ? 
                ORDER BY p.created_at DESC";
    }
    $stmt = $pdo->prepare($query);
    $stmt->execute([$patient_id]);
    $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response['success'] = true;
    $response['data'] = $prescriptions;
    $response['debug'] = [
        'hasDoctorid' => $hasDoctorid
    ];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 