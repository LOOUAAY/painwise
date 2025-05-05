<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    // Check if it's a doctor or patient requesting appointments
    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : null;
    $patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : null;
    
    if (!$doctor_id && !$patient_id) {
        throw new Exception('Either doctor_id or patient_id is required');
    }
    
    $params = [];
    // The table has a datetime column but our frontend expects date and time separately
    // Let's extract the date and time parts from the datetime column
    $query = "SELECT a.id, a.doctor_id, a.patient_id, a.type, a.notes, a.status, a.created_at,
              DATE(a.datetime) as appointment_date, 
              TIME(a.datetime) as appointment_time,
              p.name as patient_name, p.email as patient_email,
              d.name as doctor_name, d.email as doctor_email
              FROM appointments a
              JOIN patients p ON a.patient_id = p.id
              JOIN doctors d ON a.doctor_id = d.id
              WHERE ";
              
    if ($doctor_id) {
        $query .= "a.doctor_id = ?";
        $params[] = $doctor_id;
    } else {
        $query .= "a.patient_id = ?";
        $params[] = $patient_id;
    }
    
    $query .= " ORDER BY a.datetime ASC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['success'] = true;
    $response['data'] = $appointments;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
