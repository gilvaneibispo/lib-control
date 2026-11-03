<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;
use Illuminate\Support\Facades\DB;

use App\Enums\CodigoErro;
use App\Enums\StatusExemplar;
use App\Exceptions\RegrasException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExemplarRequest;
use App\Http\Resources\ExemplarResource;
use App\Models\Emprestimo;
use App\Models\Exemplar;
use App\Models\Livro;
use App\Models\Reserva;
use App\Services\LivroService;

class ExemplarController extends Controller
{
    public function __construct(private readonly LivroService $livros) {}

    public function index(Livro $livro): Anonimos
    {
        return ExemplarResource::collection($livro->exemplares()->get());
    }

    public function store(Request $request, Livro $livro): JsonResponse
    {
        $dados = $request->validate([
            'quantidade' => ['sometimes', 'integer', 'min:1', 'max:' . config('lib-control.exemplares.quantidade_max')],
        ]);

        $criados = $this->livros->adicionarExemplares($livro, (int) ($dados['quantidade'] ?? 1));

        return ExemplarResource::collection($criados)->response()->setStatusCode(201);
    }

    public function buscar(Request $request): Anonimos
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:200'],
            'disponivel' => ['nullable', 'boolean'],
        ]);
        $termo = trim($request->string('q')->toString());

        $exemplares = Exemplar::query()
            ->with('livro.autores')
            ->whereHas('livro')
            ->when($termo !== '', fn($q) => $q->where(fn($w) => $w
                ->where('codigo', 'ilike', $termo . '%')
                ->orWhereHas('livro', fn($l) => $l->busca($termo))))
            ->when($request->boolean('disponivel'), fn($q) => $q->where('status', StatusExemplar::Disponivel))
            ->orderBy('livro_id')
            ->orderBy('id')
            ->limit(20)
            ->get();

        return ExemplarResource::collection($exemplares);
    }

    public function update(ExemplarRequest $request, Exemplar $exemplar): ExemplarResource
    {
        return DB::transaction(function () use ($request, $exemplar) {
            $exemplar = Exemplar::query()->whereKey($exemplar->id)->lockForUpdate()->firstOrFail();
            if ($exemplar->status->emUso()) {
                throw new RegrasException(CodigoErro::ExemplarEmUso);
            }
            $exemplar->update($request->validated());

            return new ExemplarResource($exemplar);
        });
    }

    public function destroy(Exemplar $exemplar): JsonResponse
    {
        return DB::transaction(function () use ($exemplar) {
            $exemplar = Exemplar::query()->whereKey($exemplar->id)->lockForUpdate()->firstOrFail();
            if ($exemplar->status->emUso()) {
                throw new RegrasException(CodigoErro::ExemplarEmUso);
            }
            $temHistorico = Reserva::query()->where('exemplar_id', $exemplar->id)->exists()
                || Emprestimo::query()->where('exemplar_id', $exemplar->id)->exists();
            if ($temHistorico) {
                throw new RegrasException(CodigoErro::ExemplarComHistorico);
            }
            $exemplar->delete();

            return response()->json(null, 204);
        });
    }
}
