<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Add CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['doctor_id'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $name = $data['name'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $doctor_id = $data['doctor_id'];

    // Start transaction
    $pdo->beginTransaction();

    // Insert patient
    $stmt = $pdo->prepare("INSERT INTO patients (name, email, password) VALUES (?, ?, ?)");
    if (!$stmt->execute([$name, $email, $password])) {
        throw new Exception("Error creating patient account");
    }
    
    $patient_id = $pdo->lastInsertId();

    // Assign doctor to patient
    $stmt = $pdo->prepare("INSERT INTO doctor_patient (doctor_id, patient_id) VALUES (?, ?)");
    if (!$stmt->execute([$doctor_id, $patient_id])) {
        throw new Exception("Error assigning doctor to patient");
    }

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Patient registered successfully'
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error. Please try again.'
    ]);
}
?>