<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get notifications for a user
        if (!isset($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            ");
            $stmt->execute([$_GET['user_id']]);
            echo json_encode(['notifications' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch notifications']);
        }
        break;

    case 'POST':
        // Create a new notification
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['user_id']) || !isset($data['type']) || !isset($data['title']) || !isset($data['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO notifications (user_id, type, title, message, related_id) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['user_id'],
                $data['type'],
                $data['title'],
                $data['message'],
                $data['related_id'] ?? null
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification created successfully',
                'notification_id' => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create notification']);
        }
        break;

    case 'PUT':
        // Mark notification as read
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['notification_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Notification ID required']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = TRUE WHERE id = ?");
            $stmt->execute([$data['notification_id']]);
            
            echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update notification']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?> 