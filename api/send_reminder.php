<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

// Function to send email reminder
function sendEmailReminder($to, $subject, $message) {
    $headers = "From: noreply@painmanagement.com\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// Check for appointments that need reminders
$stmt = $pdo->prepare('
    SELECT a.*, 
           p.email as patient_email, p.name as patient_name,
           d.email as doctor_email, d.name as doctor_name,
           rp_patient.email_enabled as patient_email_enabled,
           rp_patient.browser_notifications_enabled as patient_browser_enabled,
           rp_doctor.email_enabled as doctor_email_enabled,
           rp_doctor.browser_notifications_enabled as doctor_browser_enabled
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    LEFT JOIN reminder_preferences rp_patient ON rp_patient.user_id = p.id AND rp_patient.user_type = "patient"
    LEFT JOIN reminder_preferences rp_doctor ON rp_doctor.user_id = d.id AND rp_doctor.user_type = "doctor"
    WHERE a.reminder_time <= NOW()
    AND a.reminder_sent = FALSE
    AND a.status = "confirmed"
');

$stmt->execute();
$appointments = $stmt->fetchAll();

foreach ($appointments as $appointment) {
    $remindersSent = true;

    // Send email to patient if enabled
    if ($appointment['patient_email_enabled']) {
        $patientSubject = "Reminder: Upcoming Appointment";
        $patientMessage = "
            <h2>Appointment Reminder</h2>
            <p>Dear {$appointment['patient_name']},</p>
            <p>This is a reminder for your upcoming appointment:</p>
            <ul>
                <li>Date: " . date('F j, Y', strtotime($appointment['datetime'])) . "</li>
                <li>Time: " . date('g:i A', strtotime($appointment['datetime'])) . "</li>
                <li>Type: " . ucfirst($appointment['type']) . "</li>
                <li>Doctor: {$appointment['doctor_name']}</li>
            </ul>
            <p>Please arrive 10 minutes before your scheduled time.</p>
        ";
        
        $patientEmailSent = sendEmailReminder($appointment['patient_email'], $patientSubject, $patientMessage);
        $remindersSent = $remindersSent && $patientEmailSent;
    }

    // Send email to doctor if enabled
    if ($appointment['doctor_email_enabled']) {
        $doctorSubject = "Reminder: Upcoming Patient Appointment";
        $doctorMessage = "
            <h2>Appointment Reminder</h2>
            <p>Dear Dr. {$appointment['doctor_name']},</p>
            <p>This is a reminder for your upcoming appointment with {$appointment['patient_name']}:</p>
            <ul>
                <li>Date: " . date('F j, Y', strtotime($appointment['datetime'])) . "</li>
                <li>Time: " . date('g:i A', strtotime($appointment['datetime'])) . "</li>
                <li>Type: " . ucfirst($appointment['type']) . "</li>
                <li>Patient: {$appointment['patient_name']}</li>
            </ul>
        ";

        $doctorEmailSent = sendEmailReminder($appointment['doctor_email'], $doctorSubject, $doctorMessage);
        $remindersSent = $remindersSent && $doctorEmailSent;
    }

    // Update reminder status if all enabled reminders were sent successfully
    if ($remindersSent) {
        $updateStmt = $pdo->prepare('UPDATE appointments SET reminder_sent = TRUE WHERE id = ?');
        $updateStmt->execute([$appointment['id']]);
    }
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Reminder check completed'
]); 