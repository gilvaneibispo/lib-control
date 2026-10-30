<?php

namespace App\Helpers;

final class CpfHelper
{
    public static function somenteDigitos(?string $valor): string
    {
        return (string) preg_replace('/\D/', '', (string) $valor);
    }

    public static function valido(?string $valor): bool
    {
        $cpf = self::somenteDigitos($valor);
        if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        foreach ([9, 10] as $posicao) {
            $soma = 0;
            for ($i = 0; $i < $posicao; $i++) {
                $soma += (int) $cpf[$i] * ($posicao + 1 - $i);
            }
            $digito = ($soma * 10) % 11 % 10;
            if ($digito !== (int) $cpf[$posicao]) {
                return false;
            }
        }

        return true;
    }

    public static function mascarar(?string $cpf): ?string
    {
        if ($cpf === null || strlen($cpf) !== 11) {
            return $cpf;
        }

        return '***.' . substr($cpf, 3, 3) . '.' . substr($cpf, 6, 3) . '-**';
    }
}
