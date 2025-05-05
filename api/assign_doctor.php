<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

// Get all doctors
$stmt = $pdo->query('SELECT id, name, email FROM doctors');
$doctors = $stmt->fetchAll();

// Get all patients
$stmt = $pdo->query('SELECT id, name, email FROM patients');
$patients = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Assign Doctor to Patient</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
        }
        select {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        .message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
        }
        .success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            color: #a94442;
        }
    </style>
</head>
<body>
    <h2>Assign Doctor to Patient</h2>
    
    <div class="form-group">
        <label for="doctor">Select Doctor:</label>
        <select id="doctor" required>
            <option value="">Select a doctor</option>
            <?php foreach ($doctors as $doctor): ?>
                <option value="<?php echo $doctor['id']; ?>">
                    <?php echo htmlspecialchars($doctor['name'] . ' (' . $doctor['email'] . ')'); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>

    <div class="form-group">
        <label for="patient">Select Patient:</label>
        <select id="patient" required>
            <option value="">Select a patient</option>
            <?php foreach ($patients as $patient): ?>
                <option value="<?php echo $patient['id']; ?>">
                    <?php echo htmlspecialchars($patient['name'] . ' (' . $patient['email'] . ')'); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>

    <button onclick="assignDoctor()">Assign Doctor</button>
    <div id="message"></div>

    <script>
        function assignDoctor() {
            const doctorId = document.getElementById('doctor').value;
            const patientId = document.getElementById('patient').value;
            const messageDiv = document.getElementById('message');

            if (!doctorId || !patientId) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Please select both a doctor and a patient.';
                return;
            }

            fetch('assign_patient.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    doctor_id: doctorId,
                    patient_id: patientId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = 'Doctor successfully assigned to patient!';
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = data.error || 'Failed to assign doctor to patient.';
                }
            })
            .catch(error => {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
                console.error('Error:', error);
            });
        }
    </script>
</body>
</html> 