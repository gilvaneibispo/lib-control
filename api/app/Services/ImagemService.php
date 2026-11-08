<?php

namespace App\Services;

use GdImage;
use RuntimeException;

final class ImagemService
{
    public function ajustar(string $binario, int $lado): string
    {
        $origem = @imagecreatefromstring($binario);

        if (!$origem instanceof GdImage) {
            throw new RuntimeException('Imagem inválida.');
        }

        $largura = imagesx($origem);
        $altura = imagesy($origem);

        $maiorLado = max($largura, $altura);
        $escala = min(1, $lado / $maiorLado);

        $novaLargura = max(1, (int) round($largura * $escala));
        $novaAltura = max(1, (int) round($altura * $escala));

        $destino = imagecreatetruecolor($novaLargura, $novaAltura);

        $this->fundoBranco($destino);

        imagecopyresampled(
            $destino,
            $origem,
            0,
            0,
            0,
            0,
            $novaLargura,
            $novaAltura,
            $largura,
            $altura,
        );

        ob_start();

        imagejpeg($destino, null, 85);

        return (string) ob_get_clean();
    }

    private function fundoBranco(GdImage $imagem): void
    {
        $branco = (int) imagecolorallocate($imagem, 255, 255, 255);

        imagefill($imagem, 0, 0, $branco);
    }
}
