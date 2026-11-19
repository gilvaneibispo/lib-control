<?php

namespace App\Helpers;

class CpfHelper
{

    private const POSICAO_DIGITOS_VERIFICADORES = [9, 10];
    
    /** Remove os caracteres especiais do CPF **/
    public static function somenteDigitos(?string $valor): string
    {
        return (string) preg_replace('/\D/', '', (string) $valor);
    }

    /** Checa se o CPF tem um formato válido **/
    public static function valido(?string $valor): bool
    {
        // Considera apenas os números...
        $cpf = self::somenteDigitos($valor);

        // Precisa ter 11 dígitos e não ser sequência repetida (ex.: 111.111.111-11)...
        if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        // Confere os dígitos verificadores...
        foreach (self::POSICAO_DIGITOS_VERIFICADORES as $posicao) {

            // Soma de cada dígito multiplicado pelo seu peso...
            $soma = 0;
            for ($i = 0; $i < $posicao; $i++) {
                $soma += (int) $cpf[$i] * ($posicao + 1 - $i);
            }

            // O dígito esperado é o resto de (soma * 10)/11...
            // Quando o resto é 10, o dígito vira 0...
            $digito = ($soma * 10) % 11 % 10;

            // Dígito calculado não bate, CPF inválido...
            if ($digito !== (int) $cpf[$posicao]) {
                return false;
            }
        }

        return true;
    }
}
