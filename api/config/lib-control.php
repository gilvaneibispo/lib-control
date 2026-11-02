<?php

return [
    'app_name' => env('APP_NAME', 'LibControl'),

    'exemplares' => [
        'quantidade_max' => (int) env('EXEMPLARES_QUANTIDADE_MAX', 50),
    ],

    'por_pagina' => (int) env('LIVROS_POR_PAGINA', 10),
];
