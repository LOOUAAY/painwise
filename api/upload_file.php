<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    if (!isset($_FILES['file']) || !isset($_POST['user_id'])) {
        throw new Exception('Missing required fields');
    }

    $file = $_FILES['file'];
    $userId = $_POST['user_id'];
    $description = $_POST['description'] ?? '';
    $isMedicalReport = isset($_POST['is_medical_report']) ? (bool)$_POST['is_medical_report'] : false;

    // Validate file
    $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type');
    }

    if ($file['size'] > $maxSize) {
        throw new Exception('File too large');
    }

    // Create upload directory if it doesn't exist
    $uploadDir = __DIR__ . '/uploads/' . $userId;
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $filepath = $uploadDir . '/' . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Failed to save file');
    }

    // Save file info to database
    $stmt = $pdo->prepare("INSERT INTO files (user_id, file_name, file_path, file_type, file_size, description, is_medical_report) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $userId,
        $file['name'],
        $filepath,
        $file['type'],
        $file['size'],
        $description,
        $isMedicalReport
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'file_id' => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 