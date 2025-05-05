<?php
header('Content-Type: application/json');

$response = [
    'status' => 'success',
    'message' => 'Backend is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

echo json_encode($response); 