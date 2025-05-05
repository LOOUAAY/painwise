<?php
require_once __DIR__ . '/db.php';

// Disable any headers or output buffering
ini_set('output_buffering', 'off');
ini_set('implicit_flush', true);
ob_implicit_flush(true);

echo "DESCRIBE appointments table:\n\n";

try {
    $result = $pdo->query("DESCRIBE appointments");
    $columns = $result->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($columns, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
