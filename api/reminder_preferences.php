<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

// Create reminder preferences table if it doesn't exist
$pdo->exec("CREATE TABLE IF NOT EXISTS reminder_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('patient', 'doctor') NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    browser_notifications_enabled BOOLEAN DEFAULT TRUE,
    reminder_lead_time INT DEFAULT 24, -- hours before appointment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id, user_type)
)");

// Get preferences
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    $user_type = $_GET['user_type'] ?? null;

    if (!$user_id || !$user_type) {
        echo json_encode(['success' => false, 'error' => 'Missing user information']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM reminder_preferences WHERE user_id = ? AND user_type = ?');
    $stmt->execute([$user_id, $user_type]);
    $preferences = $stmt->fetch();

    if (!$preferences) {
        // Create default preferences if none exist
        $stmt = $pdo->prepare('
            INSERT INTO reminder_preferences (user_id, user_type)
            VALUES (?, ?)
        ');
        $stmt->execute([$user_id, $user_type]);
        
        $preferences = [
            'user_id' => $user_id,
            'user_type' => $user_type,
            'email_enabled' => true,
            'browser_notifications_enabled' => true,
            'reminder_lead_time' => 24
        ];
    }

    echo json_encode(['success' => true, 'preferences' => $preferences]);
    exit;
}

// Update preferences
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['user_type'])) {
        echo json_encode(['success' => false, 'error' => 'Missing user information']);
        exit;
    }

    $stmt = $pdo->prepare('
        INSERT INTO reminder_preferences 
            (user_id, user_type, email_enabled, browser_notifications_enabled, reminder_lead_time)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            email_enabled = VALUES(email_enabled),
            browser_notifications_enabled = VALUES(browser_notifications_enabled),
            reminder_lead_time = VALUES(reminder_lead_time)
    ');

    if ($stmt->execute([
        $data['user_id'],
        $data['user_type'],
        $data['email_enabled'] ?? true,
        $data['browser_notifications_enabled'] ?? true,
        $data['reminder_lead_time'] ?? 24
    ])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update preferences']);
    }
    exit;
}

// If no valid endpoint is matched
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Invalid endpoint']); 