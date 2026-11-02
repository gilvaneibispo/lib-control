<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

if (!defined('ARQUIVO_ROTAS_SITE')) {
    define('ARQUIVO_ROTAS_SITE', __DIR__ . '/partes/site.php');
}

if (!defined('ARQUIVO_ROTAS_ADMIN')) {
    define('ARQUIVO_ROTAS_ADMIN', __DIR__ . '/partes/admin.php');
}

// Rotas públicas...
Route::group([], ARQUIVO_ROTAS_SITE);

// Rotas do admin...
Route::middleware(['auth:sanctum', 'papel:admin'])
    ->prefix('admin')
    ->group(ARQUIVO_ROTAS_ADMIN);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', fn() => response()->json(['status' => 'ok']));
