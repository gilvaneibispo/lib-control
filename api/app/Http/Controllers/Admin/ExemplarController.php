<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection as Anonimos;

use App\Enums\StatusExemplar;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExemplarRequest;
use App\Http\Resources\ExemplarResource;
use App\Models\Exemplar;
use App\Models\Livro;
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
        $exemplar->update($request->validated());

        return new ExemplarResource($exemplar);
    }

    public function destroy(Exemplar $exemplar): JsonResponse
    {
        $exemplar->delete();

        return response()->json(null, 204);
    }
}
