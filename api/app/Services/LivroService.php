<?php

namespace App\Services;

use App\Enums\CodigoErro;
use App\Exceptions\RegrasException;
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
        $emUso = $livro->exemplares()->whereIn('status', ['reservado', 'emprestado'])->exists();
        if ($emUso) {
            throw new RegrasException(
                CodigoErro::ExemplarEmUso,
                'O livro tem exemplares reservados ou emprestados.'
            );
        }

        $livro->delete();
    }

    public function adicionarExemplares(Livro $livro, int $quantidade): array
    {
        $criados = [];
        $seq = $this->ultimaSequencia($livro);

        for ($i = 0; $i < $quantidade; $i++) {
            $criados[] = $this->criarExemplar($livro, $seq);
        }

        return $criados;
    }

    private function criarExemplar(Livro $livro, int &$seq): Exemplar
    {
        $codigoEmUso = false;
        do {
            $codigo = $livro->id . '-' . (++$seq);
            $codigoEmUso = Exemplar::query()->where('codigo', $codigo)->exists();
        } while ($codigoEmUso);

        return $livro->exemplares()->create(['codigo' => $codigo]);
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
