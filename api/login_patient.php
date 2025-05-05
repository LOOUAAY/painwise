<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Use cors.php instead of headers.php for consistent CORS handling
require_once __DIR__ . '/cors.php';

// Add CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'error' => 'Missing email or password.']);
        exit;
    }

    $email = $data['email'];
    $password = $data['password'];

    // First get the patient
    $stmt = $pdo->prepare('SELECT * FROM patients WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Get the assigned doctor
        $stmt = $pdo->prepare('SELECT doctor_id FROM doctor_patient WHERE patient_id = ?');
        $stmt->execute([$user['id']]);
        $doctor = $stmt->fetch();
        
        if ($doctor) {
            $user['doctor_id'] = $doctor['doctor_id'];
        } else {
            // If no doctor is assigned, return an error
            echo json_encode([
                'success' => false, 
                'error' => 'No doctor assigned. Please contact your administrator.'
            ]);
            exit;
        }
        
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error. Please try again.']);
}