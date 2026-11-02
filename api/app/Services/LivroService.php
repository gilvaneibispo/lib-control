<?php

namespace App\Services;

use App\Models\Livro;
use App\Helpers\LivroHelper;
use Illuminate\Support\Facades\DB;

final class LivroService
{
    public function __construct(private readonly LivroHelper $helper) {}

    public function criar(array $dados): Livro
    {
        $this->helper->teste();

        return DB::transaction(function () use ($dados) {
            $livro = new Livro;
            $this->preencher($livro, $dados);
            $livro->save();

            return $livro;
        });
    }

    public function atualizar(Livro $livro, array $dados): Livro
    {
        return DB::transaction(function () use ($livro, $dados) {
            $this->preencher($livro, $dados);
            $livro->save();

            return $livro;
        });
    }

    public function excluir(Livro $livro): void
    {
        $livro->delete();
    }

    private function preencher(Livro $livro, array $dados): void
    {
        $livro->fill(collect($dados)->only([
            'titulo',
            'subtitulo',
            'isbn',
            'ano',
            'editora',
            'sinopse',
            'cdd',
            'cdu',
        ])->all());
    }
}
