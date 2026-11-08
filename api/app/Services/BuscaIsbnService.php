<?php

namespace App\Services;

use App\Enums\OrigemCapa;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

final class BuscaIsbnService
{
    private const CAMPOS_COMPLEMENTARES = ['subtitulo', 'editora', 'ano', 'sinopse'];

    public function buscar(string $isbn13): ?array
    {
        $chave = "isbn:{$isbn13}";
        $cache = Cache::get($chave);

        if (is_array($cache)) {
            return $cache;
        }

        $resultado = null;
        $capas = [];

        foreach ($this->fontes() as $fonte => $consultar) {
            try {
                $dados = $consultar($isbn13);
            } catch (Throwable $e) {
                Log::warning("Falha na consulta de ISBN em {$fonte}", [
                    'isbn' => $isbn13,
                    'erro' => $e->getMessage(),
                ]);

                continue;
            }

            if ($dados === null) {
                continue;
            }

            $capas = [...$capas, ...$dados['capas']];

            if ($resultado === null) {
                $resultado = [...$dados, 'fonte' => $fonte];
            } else {
                $resultado = $this->completar($resultado, $dados);
            }

            $temCapa = $capas !== [];
            $temAutores = $resultado['autores'] !== [];

            if ($temCapa && $temAutores) {
                break;
            }
        }

        if ($resultado === null) {
            return null;
        }

        if ($capas === []) {
            $capas[] = [
                'origem' => OrigemCapa::OpenLibrary->value,
                'url' => "https://covers.openlibrary.org/b/isbn/{$isbn13}-L.jpg?default=false",
            ];
        }

        $capasUnicas = array_unique($capas, SORT_REGULAR);

        $resultado['capas'] = array_values($capasUnicas);

        $dias = (int) config('lib-control.externas.cache_isbn_dias');
        $validade = now()->addDays($dias);

        Cache::put($chave, $resultado, $validade);

        return $resultado;
    }

    private function completar(array $resultado, array $dados): array
    {
        foreach (self::CAMPOS_COMPLEMENTARES as $campo) {
            $resultado[$campo] ??= $dados[$campo];
        }

        if ($resultado['autores'] === []) {
            $resultado['autores'] = $dados['autores'];
        }

        return $resultado;
    }

    private function fontes(): array
    {
        return [
            OrigemCapa::BrasilApi->value => $this->brasilApi(...),
            OrigemCapa::OpenLibrary->value => $this->openLibrary(...),
            OrigemCapa::Google->value => $this->googleBooks(...),
        ];
    }

    private function http(): PendingRequest
    {
        $timeout = (int) config('lib-control.externas.timeout');

        return Http::timeout($timeout)->acceptJson();
    }

    private function brasilApi(string $isbn): ?array
    {
        $resposta = $this->http()->get("https://brasilapi.com.br/api/isbn/v1/{$isbn}");

        if (!$resposta->successful() || !$resposta->json('title')) {
            return null;
        }

        $capa = $resposta->json('cover_url');
        $capas = [];

        if ($capa) {
            $capas[] = [
                'origem' => OrigemCapa::BrasilApi->value,
                'url' => $this->https($capa),
            ];
        }

        return $this->montar(
            titulo: $resposta->json('title'),
            subtitulo: $resposta->json('subtitle'),
            autores: (array) $resposta->json('authors', []),
            editora: $resposta->json('publisher'),
            ano: $resposta->json('year'),
            sinopse: $resposta->json('synopsis'),
            capas: $capas,
        );
    }

    private function openLibrary(string $isbn): ?array
    {
        $resposta = $this->http()->get("https://openlibrary.org/isbn/{$isbn}.json");

        if (!$resposta->successful() || !$resposta->json('title')) {
            return null;
        }

        $descricao = $resposta->json('description');

        if (is_array($descricao)) {
            $descricao = $descricao['value'] ?? null;
        }

        $editoras = (array) $resposta->json('publishers', []);

        return $this->montar(
            titulo: $resposta->json('title'),
            subtitulo: $resposta->json('subtitle'),
            autores: $this->autoresOpenLibrary((array) $resposta->json('authors', [])),
            editora: $editoras[0] ?? null,
            ano: $resposta->json('publish_date'),
            sinopse: $descricao,
            capas: $this->capasOpenLibrary((array) $resposta->json('covers', [])),
        );
    }

    private function autoresOpenLibrary(array $autores): array
    {
        $nomes = [];

        foreach (array_slice($autores, 0, 5) as $autor) {
            if (!is_array($autor) || !isset($autor['key'])) {
                continue;
            }

            $nome = $this->nomeAutorOpenLibrary((string) $autor['key']);

            if ($nome) {
                $nomes[] = $nome;
            }
        }

        return $nomes;
    }

    private function capasOpenLibrary(array $ids): array
    {
        $capas = [];

        foreach ($ids as $id) {
            if (!is_int($id) || $id <= 0) {
                continue;
            }

            $capas[] = [
                'origem' => OrigemCapa::OpenLibrary->value,
                'url' => "https://covers.openlibrary.org/b/id/{$id}-L.jpg",
            ];

            if (count($capas) === 3) {
                break;
            }
        }

        return $capas;
    }

    private function nomeAutorOpenLibrary(string $chave): ?string
    {
        try {
            $resposta = $this->http()->get("https://openlibrary.org{$chave}.json");
        } catch (ConnectionException) {
            return null;
        }

        if (!$resposta->successful()) {
            return null;
        }

        return $resposta->json('name') ?: null;
    }

    private function googleBooks(string $isbn): ?array
    {
        $parametros = ['q' => "isbn:{$isbn}"];
        $chaveApi = config('lib-control.externas.google_books_key');

        if ($chaveApi) {
            $parametros['key'] = $chaveApi;
        }

        $resposta = $this->http()->get('https://www.googleapis.com/books/v1/volumes', $parametros);

        $info = $resposta->successful()
            ? $resposta->json('items.0.volumeInfo')
            : null;

        if (!is_array($info) || empty($info['title'])) {
            return null;
        }

        $imagem = $info['imageLinks']['thumbnail']
            ?? $info['imageLinks']['smallThumbnail']
            ?? null;

        $capas = [];

        if (is_string($imagem)) {
            $semDobra = str_replace('&edge=curl', '', $imagem);

            $capas[] = [
                'origem' => OrigemCapa::Google->value,
                'url' => $this->https($semDobra),
            ];
        }

        return $this->montar(
            titulo: $info['title'],
            subtitulo: $info['subtitle'] ?? null,
            autores: (array) ($info['authors'] ?? []),
            editora: $info['publisher'] ?? null,
            ano: $info['publishedDate'] ?? null,
            sinopse: $info['description'] ?? null,
            capas: $capas,
        );
    }

    private function montar(
        mixed $titulo,
        mixed $subtitulo,
        array $autores,
        mixed $editora,
        mixed $ano,
        mixed $sinopse,
        array $capas,
    ): array {
        $nomesAutores = array_map(fn($autor) => $this->texto($autor), $autores);
        $autoresValidos = array_filter($nomesAutores);

        return [
            'titulo' => $this->texto($titulo),
            'subtitulo' => $this->texto($subtitulo),
            'autores' => array_values($autoresValidos),
            'editora' => $this->texto($editora),
            'ano' => $this->ano($ano),
            'sinopse' => $this->texto($sinopse),
            'capas' => $capas,
        ];
    }

    private function texto(mixed $valor): ?string
    {
        if (!is_string($valor) || trim($valor) === '') {
            return null;
        }

        $semTags = strip_tags($valor);

        return trim($semTags);
    }

    private function ano(mixed $valor): ?int
    {
        if (is_int($valor)) {
            return $valor;
        }

        $encontrou = is_string($valor)
            && preg_match('/\b(1[4-9]\d{2}|20\d{2})\b/', $valor, $partes);

        if (!$encontrou) {
            return null;
        }

        return (int) $partes[1];
    }

    private function https(string $url): string
    {
        return (string) preg_replace('#^http://#', 'https://', $url);
    }
}
