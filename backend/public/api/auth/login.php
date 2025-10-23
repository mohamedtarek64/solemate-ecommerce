<?php
// Login endpoint
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['email']) && isset($input['password'])) {
        $email = $input['email'];
        $password = $input['password'];

        // Simple hardcoded check for testing
        if ($email === 'admin@example.com' && $password === 'password123') {
            echo json_encode([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => 1,
                        'name' => 'Admin User',
                        'email' => 'admin@example.com',
                        'role' => 'admin'
                    ],
                    'token' => 'test-token-' . time(),
                    'refresh_token' => 'refresh-token-' . time()
                ],
                'message' => 'Login successful'
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid credentials'
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email and password required'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>
