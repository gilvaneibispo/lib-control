<?php

namespace App\Enums;

/** Códigos para erros de modo geral. **/
enum CodigoErro: string
{
    // Erros de login...
    case CredenciaisInvalidas = 'CREDENCIAIS_INVALIDAS';
    case PapelIncompativel = 'PAPEL_INCOMPATIVEL';

    // Obter mensagens de erros pelo código de erro...
    public function mensagem(): string
    {
        return match ($this) {
            self::CredenciaisInvalidas  => 'E-mail ou senha incorretos.',
            self::PapelIncompativel     => 'Este usuário não tem acesso a este aplicativo.',
        };
    }
}
