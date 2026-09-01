<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function create(User $user): bool
    {
        return $user->canManageProducts();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->canManageProducts();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->canManageProducts();
    }
}