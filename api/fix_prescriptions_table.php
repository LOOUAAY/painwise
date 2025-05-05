<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$response = ['success' => false, 'messages' => [], 'errors' => []];

try {
    // First check if the prescriptions table exists
    $checkTable = $pdo->query("SHOW TABLES LIKE 'prescriptions'");
    $tableExists = $checkTable->rowCount() > 0;

    if (!$tableExists) {
        // Create the prescriptions table if it doesn't exist
        $pdo->exec("CREATE TABLE prescriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            doctor_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            dosage VARCHAR(255) NOT NULL,
            schedule VARCHAR(255) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NULL,
            notes TEXT NULL,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )");
        $response['messages'][] = "Prescriptions table created";
    } else {
        $response['messages'][] = "Prescriptions table exists";

        // Check for required columns
        $requiredColumns = [
            'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
            'patient_id' => 'INT NOT NULL',
            'doctor_id' => 'INT NOT NULL',
            'name' => 'VARCHAR(255) NOT NULL',
            'dosage' => 'VARCHAR(255) NOT NULL',
            'schedule' => 'VARCHAR(255) NOT NULL',
            'start_date' => 'DATE NOT NULL',
            'end_date' => 'DATE NULL',
            'notes' => 'TEXT NULL',
            'status' => "VARCHAR(50) DEFAULT 'active'",
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ];

        // Get existing columns
        $columnsResult = $pdo->query("SHOW COLUMNS FROM prescriptions");
        $existingColumns = [];
        while ($column = $columnsResult->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[$column['Field']] = true;
        }

        // Add missing columns
        foreach ($requiredColumns as $column => $definition) {
            if (!isset($existingColumns[$column])) {
                try {
                    $pdo->exec("ALTER TABLE prescriptions ADD COLUMN $column $definition");
                    $response['messages'][] = "Added missing column: $column";
                } catch (Exception $e) {
                    $response['errors'][] = "Error adding column $column: " . $e->getMessage();
                }
            }
        }
        
        // Check for missing foreign keys
        $foreignKeysResult = $pdo->query("SHOW CREATE TABLE prescriptions");
        $createTableSql = $foreignKeysResult->fetchColumn(1);
        
        // Check if doctor_id foreign key exists
        if (strpos($createTableSql, 'FOREIGN KEY (`doctor_id`)') === false) {
            try {
                $pdo->exec("ALTER TABLE prescriptions ADD CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE");
                $response['messages'][] = "Added foreign key for doctor_id";
            } catch (Exception $e) {
                $response['errors'][] = "Error adding foreign key for doctor_id: " . $e->getMessage();
            }
        }
        
        // Check if patient_id foreign key exists
        if (strpos($createTableSql, 'FOREIGN KEY (`patient_id`)') === false) {
            try {
                $pdo->exec("ALTER TABLE prescriptions ADD CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE");
                $response['messages'][] = "Added foreign key for patient_id";
            } catch (Exception $e) {
                $response['errors'][] = "Error adding foreign key for patient_id: " . $e->getMessage();
            }
        }
    }

    $response['success'] = true;
} catch (Exception $e) {
    $response['errors'][] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
