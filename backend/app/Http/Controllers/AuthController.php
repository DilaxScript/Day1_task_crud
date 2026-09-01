<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            $data = $request->validated();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']), // Fixed: Hash password
                'role' => Role::Viewer->value,
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Account created successfully.',
                'user' => $user,
                'token' => $token,
            ], 201);

        } catch (Exception $e) {
            Log::error('Registration failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $data = $request->validated();

            $user = User::where('email', $data['email'])->first();

            if (!$user || !Hash::check($data['password'], $user->password)) {
                return response()->json(['message' => 'Invalid credentials.'], 401);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Logged in successfully.',
                'user' => $user,
                'token' => $token,
            ]);

        } catch (Exception $e) {
            Log::error('Login failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Login failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            return response()->json(['user' => $request->user()]);

        } catch (Exception $e) {
            Log::error('Failed to fetch user: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to fetch user details.'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => 'Logged out successfully.']);

        } catch (Exception $e) {
            Log::error('Logout failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Logout failed. Please try again.'
            ], 500);
        }
    }
}
