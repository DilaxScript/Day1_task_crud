<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return User::orderBy('id')->get(['id', 'name', 'email', 'role', 'created_at']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'in:' . implode(',', Role::values())],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
        ]);

        return response()->json(['message' => 'User created.', 'user' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'confirmed', Rules\Password::defaults()],
            'role' => ['sometimes', 'in:' . implode(',', Role::values())],
        ]);

        $user->update($data);

        return response()->json(['message' => 'User updated.', 'user' => $user]);
    }

    public function destroy(User $user)
    {
        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Super Admin cannot be deleted.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
