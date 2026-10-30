<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Autenticação
Route::prefix('auth')->group(function () {
    Route::post('/registrar', [AuthController::class, 'registrar'])->middleware('throttle:10,1');
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', fn() => response()->json(['status' => 'ok']));
