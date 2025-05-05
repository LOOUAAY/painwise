<?php
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    if (!isset($_GET['doctor_id'])) {
        echo json_encode(['success' => false, 'error' => 'Doctor ID is required']);
        exit;
    }

    $doctor_id = $_GET['doctor_id'];

    // Get all patients assigned to this doctor through the doctor_patient relationship table
    $stmt = $pdo->prepare('
        SELECT p.*, 
               (SELECT COUNT(*) FROM pain_logs WHERE patient_id = p.id) as total_logs
        FROM patients p
        INNER JOIN doctor_patient dp ON p.id = dp.patient_id
        WHERE dp.doctor_id = ?
        ORDER BY p.name ASC
    ');
    
    $stmt->execute([$doctor_id]);
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each patient, get their recent pain logs (showing only fields that exist)
    foreach ($patients as &$patient) {
        $stmt = $pdo->prepare('
            SELECT id, patient_id, pain_points, functionality, mood, anxiety, sleep, medication, nutrition, exercise, log_time 
            FROM pain_logs 
            WHERE patient_id = ? 
            ORDER BY log_time DESC 
            LIMIT 10
        ');
        $stmt->execute([$patient['id']]);
        $patient['logs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        'success' => true,
        'patients' => $patients
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?> 