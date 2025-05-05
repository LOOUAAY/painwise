<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $name = $data['name'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO doctors (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $password]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error. Please try again.']);
}
?>