<?php
require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$datetime = $data['datetime'] ?? null;
$type = $data['type'] ?? null;
$notes = $data['notes'] ?? null;

if (!$id || !$datetime) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$stmt = $pdo->prepare('UPDATE appointments SET datetime=?, type=?, notes=? WHERE id=?');
if ($stmt->execute([$datetime, $type, $notes, $id])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to update appointment']);
} 