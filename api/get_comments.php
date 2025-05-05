<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$log_id = $_GET['log_id'] ?? null;
if (!$log_id) {
    echo json_encode(['success' => false, 'error' => 'Missing log_id']);
    exit;
}

$stmt = $pdo->prepare('SELECT doctor_id, comment, created_at FROM pain_log_comments WHERE log_id=? ORDER BY created_at DESC');
$stmt->execute([$log_id]);
$comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['success' => true, 'comments' => $comments]); 