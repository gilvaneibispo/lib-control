<?php

namespace App\Enums;

enum StatusEmprestimo: string
{
    case Ativo = 'ativo';
    case Atrasado = 'atrasado';
    case Devolvido = 'devolvido';
}
