<?php

namespace App\Enums;

enum FakeTemp: string
{
    case LIVRO_CDU = '123';
    case LIVRO_CDD = '123.4';
    case LIVRO_ISBN = '978-3-16-148410-0';
    case LIVRO_CAPA_PATH = 'capas/capa-exemplo.jpg';
    case USUARIO_FOTO_PERFIL_PATH = 'perfis/foto-padrao.png';
}
