<?php

declare(strict_types=1);

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Http\Resources\LivroResource;
use App\Models\Livro;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

class LivroController extends Controller
{
    public function index(): Anonimos
    {
        $livros = Livro::query()
            ->with(['autores', 'area', 'subarea'])
            ->orderBy('titulo')
            ->orderBy('id')
            ->paginate(config('lib-control.por_pagina'))
            ->withQueryString();

        return LivroResource::collection($livros);
    }

    public function show(Livro $livro): LivroResource
    {
        return new LivroResource($livro->load(['autores', 'area', 'subarea']));
    }
}
