<?php

namespace App\Http\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class ApiExceptionHandler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson()) {
            // Handle validation errors
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => $exception->errors()
                ], 422);
            }

            // Handle authorization errors
            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'message' => 'You are not authorized to perform this action.'
                ], 403);
            }

            // Handle model not found
            if ($exception instanceof ModelNotFoundException) {
                return response()->json([
                    'message' => 'Resource not found.'
                ], 404);
            }

            // Handle not found
            if ($exception instanceof NotFoundHttpException) {
                return response()->json([
                    'message' => 'Endpoint not found.'
                ], 404);
            }

            // Handle other exceptions
            return response()->json([
                'message' => 'An unexpected error occurred.',
                'error' => config('app.debug') ? $exception->getMessage() : null
            ], 500);
        }

        return parent::render($request, $exception);
    }
}
