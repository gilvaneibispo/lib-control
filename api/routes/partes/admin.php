<?php

use App\Http\Controllers\Admin\LivroController;

// Livros
Route::apiResource('livros', LivroController::class);
