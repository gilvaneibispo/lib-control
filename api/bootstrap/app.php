<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middlewares\VerificarPapel;

if (!defined('ARQUIVO_ROTAS_API')) {
    define('ARQUIVO_ROTAS_API', __DIR__ . '/../routes/api.php');
}

if (!defined('ARQUIVO_ROTAS_CONSOLE')) {
    define('ARQUIVO_ROTAS_CONSOLE', __DIR__ . '/../routes/console.php');
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: ARQUIVO_ROTAS_API,
        commands: ARQUIVO_ROTAS_CONSOLE,
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->redirectGuestsTo(fn() => null);
        $middleware->alias([
            'papel' => VerificarPapel::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
