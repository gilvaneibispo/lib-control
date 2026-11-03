<?php

return [
    'app_name' => env('APP_NAME', 'LibControl'),

    'exemplares' => [
        'quantidade_max' => (int) env('EXEMPLARES_QUANTIDADE_MAX', 50),
    ],

    'por_pagina' => (int) env('LIVROS_POR_PAGINA', 10),

    'reserva_dias' => (int) env('RESERVA_DIAS', 3),
    'emprestimo_dias' => (int) env('EMPRESTIMO_DIAS', 15),
    'limite_itens_por_leitor' => (int) env('LIMITE_ITENS_POR_LEITOR', 3),
    'desbloqueio_automatico' => (bool) env('DESBLOQUEIO_AUTOMATICO', false),
];
