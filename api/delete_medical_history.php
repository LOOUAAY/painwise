<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || empty($data['id'])) {
        throw new Exception('Medical history ID is required');
    }
    
    $history_id = intval($data['id']);
    
    // Delete the medical history record
    $stmt = $pdo->prepare("DELETE FROM medical_history WHERE id = ?");
    $stmt->execute([$history_id]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Medical history record not found or already deleted');
    }
    
    $response['success'] = true;
    $response['data'] = ['id' => $history_id];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
