<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\LivroController;
use App\Http\Controllers\Admin\UsuarioController;

Route::prefix('auth')->group(function () {
    Route::post('/registrar', [AuthController::class, 'registrar'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'obterUsuarioLogado'])->middleware('auth:sanctum');
});

Route::middleware(['auth:sanctum', 'papel:admin'])->prefix('admin')->group(function () {
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::get('/usuarios/{usuario}', [UsuarioController::class, 'show']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::post('/usuarios/{usuario}/tornar-admin', [UsuarioController::class, 'tornarAdmin']);

    // Livros
    Route::apiResource('livros', LivroController::class);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', fn () => ['status' => 'ok']);

// Rota inexistente...
Route::fallback(fn () => response()->json([
    'codigo' => 'ROTA_NAO_ENCONTRADA',
    'mensagem' => 'Rota não encontrada.',
], 404));
