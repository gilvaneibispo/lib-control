<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Autor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:150'],
        ]);

        $termo = trim($request->string('q')->toString());
        $termoEscapado = str_replace(['%', '_'], ['\%', '\_'], $termo);
        $like = '%' . $termoEscapado . '%';

        $nomes = Autor::query()
            ->when($termo !== '', fn($q) => $q->where('nome', 'ilike', $like))
            ->orderBy('nome')
            ->limit(10)
            ->pluck('nome');

        return response()->json(['data' => $nomes]);
    }
}
