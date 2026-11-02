<?php

namespace App\Http\Middlewares;

use App\Enums\Papel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarPapel
{
    public function handle(Request $request, Closure $next, string $papel): Response
    {
        $user = $request->user();

        if ($user === null || $user->papel !== Papel::from($papel)) {
            return response()->json([
                'codigo' => 'ACESSO_NEGADO', // Vai Curinthia...
                'mensagem' => 'Você não tem permissão para esta ação.',
            ], 403);
        }

        return $next($request);
    }
}
