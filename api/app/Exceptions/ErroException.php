<?php

namespace App\Exceptions;

use Exception;
use App\Enums\CodigoErro as Erros;

class ErroException extends Exception
{
    public Erros $codigo;
    public int $status;
    public array $extra;

    public function __construct(Erros $codigo, $mensagem = null, $status = 422, $extra = [])
    {
        $this->codigo = $codigo;
        $this->status = $status;
        $this->extra  = $extra;

        if ($mensagem === null) {
            // Mensagem padrão do enum 'CodigoErro';
            $mensagem = $codigo->mensagem();
        }

        parent::__construct($mensagem);
    }

    public function render()
    {
        $dados = [
            'codigo' => $this->codigo->value,
            'mensagem' => $this->getMessage(),
        ];

        return response()->json(
            array_merge($dados, $this->extra), 
            $this->status
        );
    }
}
