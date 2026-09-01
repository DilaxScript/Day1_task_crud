<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $users = [
            ['name' => 'Super Admin', 'email' => 'superadmin@example.com', 'role' => 'super_admin'],
            ['name' => 'Admin', 'email' => 'admin@example.com', 'role' => 'admin'],
            ['name' => 'Editor', 'email' => 'editor@example.com', 'role' => 'editor'],
            ['name' => 'Viewer', 'email' => 'viewer@example.com', 'role' => 'viewer'],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => 'password',
                    'role' => $data['role'],
                ],
            );
        }
    }
}
