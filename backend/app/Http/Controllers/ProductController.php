<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class ProductController extends Controller
{
    public function index()
    {
        try {
            return Product::with('user:id,name')->latest()->get();

        } catch (Exception $e) {
            Log::error('Failed to fetch products: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to fetch products.'
            ], 500);
        }
    }

    public function store(StoreProductRequest $request)
    {
        try {
            $data = $request->validated();

            $product = Product::create([
                ...$data,
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Product created successfully.',
                'product' => $product
            ], 201);

        } catch (Exception $e) {
            Log::error('Failed to create product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to create product. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function show(Product $product)
    {
        try {
            return $product->load('user:id,name');

        } catch (Exception $e) {
            Log::error('Failed to fetch product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to fetch product details.'
            ], 500);
        }
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        try {
            $data = $request->validated();
            $product->update($data);

            return response()->json([
                'message' => 'Product updated successfully.',
                'product' => $product
            ]);

        } catch (Exception $e) {
            Log::error('Failed to update product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to update product. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function destroy(Product $product)
    {
        try {
            $this->authorize('delete', $product);
            $product->delete();

            return response()->json(['message' => 'Product deleted successfully.']);

        } catch (Exception $e) {
            Log::error('Failed to delete product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to delete product. Please try again.'
            ], 500);
        }
    }
}
