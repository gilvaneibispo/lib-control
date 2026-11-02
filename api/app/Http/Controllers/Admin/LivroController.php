<?php

namespace App\Http\Controllers\Admin;

// Classes do Laravel
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

// Classes do projeto
use App\Http\Controllers\Controller;
use App\Http\Resources\LivroResource;
use App\Http\Requests\LivroRequest;
use App\Models\Livro;
use App\Services\LivroService;

class LivroController extends Controller
{
    public function __construct(private readonly LivroService $livros) {}

    public function index(Request $request): Anonimos
    {

        $livrosPorPaginas = config('lib-control.por_pagina');
        $request->validate([
            'q' => ['nullable', 'string', 'max:200'],
        ]);

        $livros = Livro::query()
            ->with(['autores'])
            ->latest('id')
            ->paginate($livrosPorPaginas)
            ->withQueryString();

        return LivroResource::collection($livros);
    }

    public function store(LivroRequest $request): JsonResponse
    {

        $livro = $this->livros->criar($request->validated());

        return (new LivroResource($livro))->response()->setStatusCode(201);
    }

    public function show(Livro $livro): JsonResponse
    {
        return (new LivroResource($livro))->response();
    }

    public function update(LivroRequest $request, Livro $livro): LivroResource
    {
        return new LivroResource($this->livros->atualizar($livro, $request->validated()));
    }

    public function destroy(Livro $livro): JsonResponse
    {
        $this->livros->excluir($livro);

        return response()->json(null, 204);
    }
}
