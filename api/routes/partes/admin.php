<?php

use App\Http\Controllers\Admin\ExemplarController;
use App\Http\Controllers\Admin\LivroController;

// Livros
Route::apiResource('livros', LivroController::class);

// Exemplares
Route::get('/livros/{livro}/exemplares', [ExemplarController::class, 'index']);
Route::post('/livros/{livro}/exemplares', [ExemplarController::class, 'store']);
Route::get('/exemplares', [ExemplarController::class, 'buscar']);
Route::patch('/exemplares/{exemplar}', [ExemplarController::class, 'update']);
Route::delete('/exemplares/{exemplar}', [ExemplarController::class, 'destroy']);
