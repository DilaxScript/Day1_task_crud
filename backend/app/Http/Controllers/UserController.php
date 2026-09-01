<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            return User::orderBy('id')->get(['id', 'name', 'email', 'role', 'created_at']);

        } catch (Exception $e) {
            Log::error('Failed to fetch users: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to fetch users.'
            ], 500);
        }
    }

    public function store(StoreUserRequest $request)
    {
        try {
            $data = $request->validated();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']), // Fixed: Hash password
                'role' => $data['role'],
            ]);

            return response()->json([
                'message' => 'User created successfully.',
                'user' => $user
            ], 201);

        } catch (Exception $e) {
            Log::error('Failed to create user: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to create user. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $data = $request->validated();

            // Hash password if it's being updated
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            return response()->json([
                'message' => 'User updated successfully.',
                'user' => $user
            ]);

        } catch (Exception $e) {
            Log::error('Failed to update user: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to update user. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            if ($user->isSuperAdmin()) {
                return response()->json([
                    'message' => 'Super Admin cannot be deleted.'
                ], 403);
            }

            $user->delete();

            return response()->json(['message' => 'User deleted successfully.']);

        } catch (Exception $e) {
            Log::error('Failed to delete user: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to delete user. Please try again.'
            ], 500);
        }
    }
}
