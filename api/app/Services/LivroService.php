<?php

namespace App\Services;

use App\Models\Exemplar;
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

            $this->adicionarExemplares($livro, (int) ($dados['quantidade_exemplares'] ?? 1));

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

    public function adicionarExemplares(Livro $livro, int $quantidade): array
    {
        $criados = [];
        $seq = $this->ultimaSequencia($livro);

        for ($i = 0; $i < $quantidade; $i++) {
            do {
                $codigo = $livro->id . '-' . (++$seq);
            } while (Exemplar::query()->where('codigo', $codigo)->exists());

            $criados[] = $livro->exemplares()->create(['codigo' => $codigo]);
        }

        return $criados;
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

        $livro->area_id = $dados['area_id'] ?? $livro->area_id;
        $livro->subarea_id = $dados['subarea_id'] ?? null;
    }

    private function ultimaSequencia(Livro $livro): int
    {
        $expressao = '/^' . $livro->id . '-(\d+)$/';
        $sequencias = fn(string $codigo) => preg_match($expressao, $codigo, $resultados)
            ? (int) $resultados[1]
            : 0;

        return (int) $livro->exemplares()
            ->pluck('codigo')
            ->map($sequencias)
            ->max();
    }
}
