<?php

namespace App\Services;

use App\Enums\CodigoErro;
use App\Enums\OrigemCapa;
use App\Exceptions\RegrasException;
use App\Models\Livro;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

final class CapaService
{
    public function __construct(private readonly ImagemService $imagens) {}

    public function salvarUpload(Livro $livro, UploadedFile $arquivo): Livro
    {
        $binario = (string) file_get_contents($arquivo->getRealPath());

        return $this->gravar($livro, $binario, OrigemCapa::Upload);
    }

    public function baixar(Livro $livro, string $url, OrigemCapa $origem): Livro
    {
        $this->validarUrl($url);

        $timeout = (int) config('lib-control.externas.timeout');

        $redirecionamentos = [
            'max' => 3,
            'protocols' => ['http', 'https'],
        ];

        try {
            $resposta = Http::timeout($timeout)
                ->withOptions(['allow_redirects' => $redirecionamentos])
                ->get($url);
        } catch (ConnectionException) {
            throw new RegrasException(CodigoErro::CapaInvalida);
        }

        $tipo = (string) $resposta->header('Content-Type');
        $corpo = $resposta->body();
        $tamanho = strlen($corpo);
        $limite = (int) config('lib-control.uploads.capa_max_kb') * 1024;

        $ehImagem = str_starts_with($tipo, 'image/');
        $tamanhoValido = $tamanho > 0 && $tamanho <= $limite;

        if (!$resposta->successful() || !$ehImagem || !$tamanhoValido) {
            throw new RegrasException(CodigoErro::CapaInvalida);
        }

        return $this->gravar($livro, $corpo, $origem);
    }

    public function remover(Livro $livro): void
    {
        if ($livro->capa_path) {
            Storage::disk('public')->delete($livro->capa_path);
        }

        $livro->forceFill([
            'capa_path' => null,
            'capa_origem' => null,
        ])->save();
    }

    private function gravar(Livro $livro, string $binario, OrigemCapa $origem): Livro
    {
        $ladoMaximo = (int) config('lib-control.uploads.capa_lado_max');

        try {
            $jpeg = $this->imagens->ajustar($binario, $ladoMaximo);
        } catch (RuntimeException) {
            throw new RegrasException(CodigoErro::CapaInvalida);
        }

        $sufixo = Str::random(8);
        $caminho = "capas/{$livro->id}-{$sufixo}.jpg";

        Storage::disk('public')->put($caminho, $jpeg);

        $anterior = $livro->capa_path;

        $livro->forceFill([
            'capa_path' => $caminho,
            'capa_origem' => $origem,
        ])->save();

        if ($anterior && $anterior !== $caminho) {
            Storage::disk('public')->delete($anterior);
        }

        return $livro;
    }

    private function validarUrl(string $url): void
    {
        $partes = parse_url($url);
        $esquema = strtolower((string) ($partes['scheme'] ?? ''));
        $host = strtolower((string) ($partes['host'] ?? ''));

        $esquemaValido = in_array($esquema, ['http', 'https'], true);
        $hostValido = $host !== '' && str_contains($host, '.');

        if (!$esquemaValido || !$hostValido) {
            throw new RegrasException(CodigoErro::CapaInvalida);
        }

        foreach ($this->resolverIps($host) as $ip) {
            $publico = filter_var(
                $ip,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
            );

            if (!$publico) {
                throw new RegrasException(CodigoErro::CapaInvalida);
            }
        }
    }

    private function resolverIps(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        if (app()->runningUnitTests()) {
            return [];
        }

        return gethostbynamel($host) ?: [];
    }
}
