<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

// Get parameters
$patient_id = $_GET['patient_id'] ?? null;
$doctor_id = $_GET['doctor_id'] ?? null;

// Debug info to track request parameters
error_log("get_patient_details.php called with patient_id=$patient_id, doctor_id=$doctor_id");

if (!$patient_id || !$doctor_id) {
    echo json_encode(['success' => false, 'error' => 'Missing required parameters', 'debug' => ['params' => $_GET]]);
    exit;
}

try {
    // Enable full error reporting
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check database tables
    error_log("Checking database tables...");
    $tables = [];
    $tableResult = $pdo->query("SHOW TABLES");
    while ($row = $tableResult->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    error_log("Available tables: " . implode(", ", $tables));
    
    // Simplified approach - just get basic patient data
    $patient = [];
    
    if (in_array('patients', $tables)) {
        error_log("Getting patient with ID: $patient_id");
        $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ?");
        $stmt->execute([$patient_id]);
        $patient = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("Patient data found: " . ($patient ? 'Yes' : 'No'));
    } else {
        error_log("Patients table not found in database.");
    }

    if (!$patient) {
        echo json_encode([
            'success' => false, 
            'error' => 'Patient not found',
            'debug' => ['patient_id' => $patient_id]
        ]);
        exit;
    }
    
    // Initialize empty arrays for related data
    $appointments = [];
    $prescriptions = [];
    
    // Check and get prescriptions if table exists
    if (in_array('prescriptions', $tables)) {
        error_log("Getting prescriptions for patient $patient_id");
        try {
            $stmt = $pdo->prepare("SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY id DESC");
            $stmt->execute([$patient_id]);
            $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Found " . count($prescriptions) . " prescriptions");
        } catch (Exception $e) {
            error_log("Error getting prescriptions: " . $e->getMessage());
        }
    }
    
    // Format the response with only the data we have
    $response = [
        'success' => true,
        'patient' => array_merge($patient, [
            'prescriptions' => $prescriptions
        ])
    ];
    
    // Debug output
    error_log("Sending response: " . json_encode(['success' => true, 'has_data' => !empty($patient)]));
    
    echo json_encode($response);

} catch (PDOException $e) {
    error_log('Patient details error: ' . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'error' => 'Database error: ' . $e->getMessage(),
        'debug_info' => [
            'patient_id' => $patient_id,
            'doctor_id' => $doctor_id
        ]
    ]);
}
?> 