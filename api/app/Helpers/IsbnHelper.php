<?php

namespace App\Helpers;

final class IsbnHelper
{
    public static function limpar(?string $valor): string
    {
        $semSeparadores = (string) preg_replace('/[^0-9Xx]/', '', (string) $valor);

        return strtoupper($semSeparadores);
    }

    public static function valido10(string $isbn): bool
    {
        if (!preg_match('/^\d{9}[\dX]$/', $isbn)) {
            return false;
        }

        $soma = 0;

        for ($i = 0; $i < 10; $i++) {
            $digito = $isbn[$i] === 'X'
                ? 10
                : (int) $isbn[$i];

            $soma += $digito * (10 - $i);
        }

        return $soma % 11 === 0;
    }

    public static function valido13(string $isbn): bool
    {
        if (!preg_match('/^97[89]\d{10}$/', $isbn)) {
            return false;
        }

        $verificador = self::digitoVerificador13(substr($isbn, 0, 12));

        return $verificador === (int) $isbn[12];
    }

    public static function valido(?string $valor): bool
    {
        $isbn = self::limpar($valor);

        return match (strlen($isbn)) {
            10 => self::valido10($isbn),
            13 => self::valido13($isbn),
            default => false,
        };
    }

    public static function para13(string $isbn10): string
    {
        $base = '978' . substr($isbn10, 0, 9);
        $verificador = self::digitoVerificador13($base);

        return $base . $verificador;
    }

    public static function normalizar(?string $valor): ?string
    {
        $isbn = self::limpar($valor);

        if (strlen($isbn) === 10 && self::valido10($isbn)) {
            return self::para13($isbn);
        }

        if (strlen($isbn) === 13 && self::valido13($isbn)) {
            return $isbn;
        }

        return null;
    }

    private static function digitoVerificador13(string $dozeDigitos): int
    {
        $soma = 0;

        for ($i = 0; $i < 12; $i++) {
            $peso = $i % 2 === 0
                ? 1
                : 3;

            $soma += (int) $dozeDigitos[$i] * $peso;
        }

        return (10 - $soma % 10) % 10;
    }
}
