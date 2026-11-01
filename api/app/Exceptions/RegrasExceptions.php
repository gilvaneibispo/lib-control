<?php

namespace App\Exceptions;

use App\Enums\CodigoErro;
use Illuminate\Http\JsonResponse;
use RuntimeException;

final class RegrasException extends RuntimeException
{

    public function __construct(
        public readonly CodigoErro $codigo,
        ?string $mensagem               = null,
        public readonly int $status     = 422,
        public readonly array $extra    = [],
    ) {
        parent::__construct($mensagem ?? $codigo->mensagem());
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'codigo' => $this->codigo->value,
            'mensagem' => $this->getMessage(),
            ...$this->extra,
        ], $this->status);
    }
}
