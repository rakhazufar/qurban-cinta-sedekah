<?php
/**
 * Midtrans Webhook Handler (Verified)
 * This script receives asynchronous notifications from Midtrans.
 */

// 1. Configuration (Sandbox Server Key)
$server_key = 'SB-Mid-server-CPGbQ-CSyGJEhcZSVvWcferI';

// 2. Read incoming JSON body from Midtrans
$raw_notification = file_get_contents('php://input');
$notification = json_decode($raw_notification, true);

// 3. Log data for audit trail (Optional but recommended for troubleshooting)
$log_file = 'midtrans_log.txt';
$log_entry = "[" . date('Y-m-d H:i:s') . "] Notification Received: " . $raw_notification . "\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

// If notification is empty or invalid, stop here
if (!$notification) {
    http_response_code(400);
    exit("Invalid notification data");
}

// 4. Verify Signature (Security: Ensure request came from Midtrans)
$order_id     = $notification['order_id'];
$status_code  = $notification['status_code'];
$gross_amount = $notification['gross_amount'];
$signature    = $notification['signature_key'];

$local_signature = hash("sha512", $order_id . $status_code . $gross_amount . $server_key);

if ($signature !== $local_signature) {
    file_put_contents($log_file, "ERROR: Invalid Signature for Order ID: $order_id\n", FILE_APPEND);
    http_response_code(403);
    exit("Invalid Signature");
}

// 5. Extract Important Fields
$transaction_status = $notification['transaction_status'];
$fraud_status       = $notification['fraud_status'] ?? '';
$payment_type       = $notification['payment_type'];

// 6. Handle Transaction Status Logic
$final_status = 'unknown';

if ($transaction_status == 'capture') {
    if ($fraud_status == 'challenge') {
        $final_status = 'challenge';
    } else if ($fraud_status == 'accept') {
        $final_status = 'success';
    }
} else if ($transaction_status == 'settlement') {
    $final_status = 'success';
} else if ($transaction_status == 'pending') {
    $final_status = 'pending';
} else if ($transaction_status == 'deny' || $transaction_status == 'cancel' || $transaction_status == 'expire') {
    $final_status = 'failed';
}

// Log the final processed status
$status_log = "Order ID: $order_id | Final Status: $final_status | Payment Type: $payment_type\n---\n";
file_put_contents($log_file, $status_log, FILE_APPEND);

/**
 * NOTE: If you need to send emails to the donor or update a database,
 * you should place that logic here inside the 'success' condition.
 */

// 7. Return 200 OK to Midtrans
// This is CRITICAL. If Midtrans doesn't get a 200 OK, it will keep retrying.
http_response_code(200);
echo json_encode(['status' => 'OK', 'order_id' => $order_id]);
