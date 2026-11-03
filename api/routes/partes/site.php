<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Leitor\MeController;
use App\Http\Controllers\Leitor\ReservaController;
use App\Http\Controllers\Site\AreaController;
use App\Http\Controllers\Site\LivroController;

// Autenticação
Route::prefix('auth')->group(function () {
    Route::post('/registrar', [AuthController::class, 'registrar'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'obterUsuarioLogado'])->middleware('auth:sanctum');
});

// Livros
Route::prefix('livros')->group(function () {
    Route::get('/', [LivroController::class, 'index']);
    Route::get('/{livro}', [LivroController::class, 'show']);
});

// Áreas
Route::get('/areas', [AreaController::class, 'index']);

// Reservas e empréstimos
Route::middleware(['auth:sanctum', 'papel:leitor'])->group(function () {
    Route::get('/me/reservas', [MeController::class, 'reservas']);
    Route::get('/me/emprestimos', [MeController::class, 'emprestimos']);

    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::post('/reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
});
