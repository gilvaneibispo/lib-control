<?php

use App\Http\Controllers\Admin\EmprestimoController;
use App\Http\Controllers\Admin\ExemplarController;
use App\Http\Controllers\Admin\LivroController;
use App\Http\Controllers\Admin\ReservaController;

// Livros
Route::apiResource('livros', LivroController::class);

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
