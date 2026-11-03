<?php

namespace App\Enums;

enum StatusExemplar: string
{
    case Disponivel = 'disponivel';
    case Reservado = 'reservado';
    case Emprestado = 'emprestado';
    case Indisponivel = 'indisponivel';

    public function emUso(): bool
    {
        return $this === self::Reservado || $this === self::Emprestado;
    }
}
