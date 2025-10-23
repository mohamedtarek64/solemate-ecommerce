<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller;

class BaseController extends Controller
{
    /**
     * Helper method to validate user and token
     */
    protected function validateUserAndToken($request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'No token provided'
                ], 401)
            ];
        }

        // Find the token in database - extract the token part after the pipe
        $tokenParts = explode('|', $token);
        if (count($tokenParts) !== 2) {
            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'Invalid token format'
                ], 401)
            ];
        }

        $tokenId = $tokenParts[0];
        $tokenHash = hash('sha256', $tokenParts[1]);

        $personalAccessToken = DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->where('token', $tokenHash)
            ->first();

        if (!$personalAccessToken) {
            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 401)
            ];
        }

        $userId = $personalAccessToken->tokenable_id;
        $user = DB::table('users')
            ->where('id', $userId)
            ->select('id', 'name', 'first_name', 'last_name', 'email', 'avatar', 'phone', 'role', 'address', 'created_at')
            ->first();

        if (!$user) {
            // If user not found, revoke the token
            DB::table('personal_access_tokens')
                ->where('id', $tokenId)
                ->delete();

            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404)
            ];
        }

        // Check if user is deleted (has deleted email)
        if (strpos($user->email, 'deleted_') === 0) {
            // Revoke the token for deleted user
            DB::table('personal_access_tokens')
                ->where('id', $tokenId)
                ->delete();

            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'User account has been deleted'
                ], 404)
            ];
        }

        return [
            'valid' => true,
            'user' => $user,
            'token_id' => $tokenId,
            'user_id' => $userId
        ];
    }

    /**
     * Helper method to validate admin user and token
     */
    protected function validateAdminUserAndToken($request)
    {
        $validation = $this->validateUserAndToken($request);

        if (!$validation['valid']) {
            return $validation;
        }

        // Check if user is admin
        if ($validation['user']->role !== 'admin') {
            return [
                'valid' => false,
                'response' => response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403)
            ];
        }

        return $validation;
    }
}
