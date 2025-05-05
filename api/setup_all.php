<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$setup_files = [
    'setup_patients_table.php',
    'setup_doctors_table.php',
    'setup_pain_logs_table.php',
    'setup_prescriptions_table.php',
    'setup_notes_table.php',
    'setup_messages_table.php',
    'setup_notifications_table.php',
    'setup_files_table.php'
];

$results = [];

foreach ($setup_files as $file) {
    try {
        require_once __DIR__ . '/' . $file;
        $results[$file] = 'success';
    } catch (Exception $e) {
        $results[$file] = 'error: ' . $e->getMessage();
    }
}

echo json_encode([
    'status' => 'completed',
    'results' => $results
]); 