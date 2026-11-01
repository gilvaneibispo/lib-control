<?php

namespace App\Enums;

enum CodigoErro: string
{
    case CredenciaisInvalidas = 'CREDENCIAIS_INVALIDAS';
    case PapelIncompativel = 'PAPEL_INCOMPATIVEL';

    public function mensagem(): string
    {
        return match ($this) {
            self::CredenciaisInvalidas => 'E-mail ou senha incorretos.',
            self::PapelIncompativel => 'Este usuário não tem acesso a este aplicativo.',
        };
    }
}
