<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$log_id = $data['log_id'] ?? null;
$doctor_id = $data['doctor_id'] ?? null;
$comment = $data['comment'] ?? null;

if (!$log_id || !$doctor_id) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Check if comment exists
$stmt = $pdo->prepare('SELECT id FROM pain_log_comments WHERE log_id=? AND doctor_id=?');
$stmt->execute([$log_id, $doctor_id]);
$existing = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existing) {
    // Update
    $stmt = $pdo->prepare('UPDATE pain_log_comments SET comment=? WHERE id=?');
    $success = $stmt->execute([$comment, $existing['id']]);
} else {
    // Insert
    $stmt = $pdo->prepare('INSERT INTO pain_log_comments (log_id, doctor_id, comment) VALUES (?, ?, ?)');
    $success = $stmt->execute([$log_id, $doctor_id, $comment]);
}

echo json_encode(['success' => $success]); 