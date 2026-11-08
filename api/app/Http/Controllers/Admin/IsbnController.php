<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CodigoErro;
use App\Exceptions\RegrasException;
use App\Helpers\IsbnHelper;
use App\Http\Controllers\Controller;
use App\Models\Livro;
use App\Services\BuscaIsbnService;
use Illuminate\Http\JsonResponse;

class IsbnController extends Controller
{
    public function show(string $isbn, BuscaIsbnService $busca): JsonResponse
    {
        $isbn13 = IsbnHelper::normalizar($isbn);

        if ($isbn13 === null) {
            throw new RegrasException(CodigoErro::IsbnInvalido);
        }

        $existente = Livro::query()
            ->where('isbn', $isbn13)
            ->first(['id', 'titulo']);

        $livroExistente = $existente?->only(['id', 'titulo']);

        $dados = $busca->buscar($isbn13);

        if ($dados === null) {
            throw new RegrasException(
                CodigoErro::IsbnNaoEncontrado,
                status: 404,
                extra: [
                    'isbn' => $isbn13,
                    'livro_existente' => $livroExistente,
                ],
            );
        }

        return response()->json([
            'data' => [
                'isbn' => $isbn13,
                ...$dados,
                'livro_existente' => $livroExistente,
            ],
        ]);
    }
}
