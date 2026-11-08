<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmprestimoController;
use App\Http\Controllers\Admin\ExemplarController;
use App\Http\Controllers\Admin\LivroController;
use App\Http\Controllers\Admin\ReservaController;
use App\Http\Controllers\Admin\UsuarioController;

Route::get('/dashboard', DashboardController::class);

// Livros
Route::apiResource('livros', LivroController::class);
Route::post('/livros/{livro}/capa', [LivroController::class, 'capa']);
Route::delete('/livros/{livro}/capa', [LivroController::class, 'removerCapa']);

// Exemplares
Route::get('/livros/{livro}/exemplares', [ExemplarController::class, 'index']);
Route::post('/livros/{livro}/exemplares', [ExemplarController::class, 'store']);
Route::get('/exemplares', [ExemplarController::class, 'buscar']);
Route::patch('/exemplares/{exemplar}', [ExemplarController::class, 'update']);
Route::delete('/exemplares/{exemplar}', [ExemplarController::class, 'destroy']);

Route::get('/reservas', [ReservaController::class, 'index']);
Route::post('/reservas/{reserva}/retirar', [ReservaController::class, 'retirar']);
Route::post('/reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar']);

Route::get('/emprestimos', [EmprestimoController::class, 'index']);
Route::post('/emprestimos', [EmprestimoController::class, 'store']);
Route::post('/emprestimos/{emprestimo}/devolver', [EmprestimoController::class, 'devolver']);

Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::get('/usuarios/{usuario}', [UsuarioController::class, 'show']);
Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
Route::post('/usuarios/{usuario}/bloquear', [UsuarioController::class, 'bloquear']);
Route::post('/usuarios/{usuario}/desbloquear', [UsuarioController::class, 'desbloquear']);
