<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExcelController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/validate', [AuthController::class, 'validateToken']);

// Dev endpoint: generates a valid JWT for testing without super-agent
Route::post('/auth/dev-login', function (\Illuminate\Http\Request $request) {
    $email = $request->input('email', 'dev@excelagent.com');
    $name = $request->input('name', 'Dev User');
    $jwt = app(\App\Services\JwtService::class);
    $token = $jwt->issueToken([
        'sub' => 1,
        'name' => $name,
        'email' => $email,
        'role' => 'user',
    ]);
    $user = ['sub' => 1, 'name' => $name, 'email' => $email, 'role' => 'user'];
    return response()->json([
        'token' => $token,
        'user' => $user,
    ]);
});

Route::get('/auth/sso', function (\Illuminate\Http\Request $request) {
    $token = $request->query('token');
    if (!$token) {
        return redirect(env('FRONTEND_URL', 'http://localhost:5177') . '/login');
    }
    $jwt = app(\App\Services\JwtService::class);
    $payload = $jwt->validateToken($token);
    if (!$payload) {
        return redirect(env('FRONTEND_URL', 'http://localhost:5177') . '/login');
    }
    $cookie = cookie(
        config('jwt.cookie', 'super_agent_token'),
        $token,
        120,
        '/',
        null,
        (bool) env('JWT_SECURE_COOKIE', false),
        true,
        false,
        'lax'
    );
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5177');
    $redirectTo = $request->query('redirect', '');
    $callbackUrl = $frontendUrl . '/auth/callback?token=' . $token;
    if ($redirectTo) {
        $callbackUrl .= '&redirect=' . urlencode($redirectTo);
    }
    return redirect($callbackUrl)
        ->withCookie($cookie);
});

Route::middleware('jwt.auth','tenant')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/generate', [ExcelController::class, 'generate']);
    Route::post('/refine', [ExcelController::class, 'refine']);
    Route::post('/research', [ExcelController::class, 'research']);
});
