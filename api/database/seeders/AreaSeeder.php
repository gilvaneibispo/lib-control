<?php

namespace Database\Seeders;

use App\Services\AreaService;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    private const DADOS = [
        [
            'codigo' => 0,
            'nome' => 'Generalidades e Computação',
            'subareas' => [
                'Conhecimento e sistemas',                  // CDD: 000, 001, 002, 003 | CDU: 00, 001
                'Computação e informática',                 // CDD: 004, 005, 006 | CDU: 004
                'Bibliografias e catálogos',                // CDD: 01 | CDU: 01
                'Biblioteconomia e ciência da informação',  // CDD: 02 | CDU: 02
                'Enciclopédias e obras de referência',      // CDD: 03 | CDU: 03
                'Periódicos e publicações seriadas',        // CDD: 05 | CDU: 05
                'Associações, organizações e museus',       // CDD: 06 | CDU: 06
                'Jornalismo, mídia e editoração',           // CDD: 07 | CDU: 07
                'Citações e coletâneas',                    // CDD: 08 | CDU: 08
                'Manuscritos e obras raras',                // CDD: 09 | CDU: 09
            ],
        ],
        [
            'codigo' => 1,
            'nome' => 'Filosofia e Psicologia',
            'subareas' => [
                'Filosofia geral',                          // CDD: 10 | CDU: 1
                'Metafísica',                               // CDD: 11 | CDU: 11
                'Epistemologia',                            // CDD: 12 | CDU: 165
                'Parapsicologia e ocultismo',               // CDD: 13 | CDU: 13
                'Escolas e sistemas filosóficos',           // CDD: 14 | CDU: 14
                'Psicologia',                               // CDD: 15 | CDU: 159.9
                'Lógica',                                   // CDD: 16 | CDU: 16
                'Ética',                                    // CDD: 17 | CDU: 17
                'Filosofia antiga, medieval e oriental',    // CDD: 18 | CDU: 1(3), 1(5)
                'Filosofia ocidental moderna',              // CDD: 19 | CDU: 1(091), 1(4)
            ],
        ],
        [
            'codigo' => 2,
            'nome' => 'Religião',
            'subareas' => [
                'Religião geral',                           // CDD: 20 | CDU: 2
                'Filosofia e teoria da religião',           // CDD: 21 | CDU: 2-1
                'Bíblia',                                   // CDD: 22 | CDU: 27-23
                'Teologia cristã',                          // CDD: 23 | CDU: 27-1
                'Prática e vida cristã',                    // CDD: 24 | CDU: 27-4
                'Igreja local e ordens religiosas',         // CDD: 25 | CDU: 27-7
                'Teologia social e culto',                  // CDD: 26 | CDU: 27-5
                'História do cristianismo',                 // CDD: 27 | CDU: 27-9
                'Denominações cristãs',                     // CDD: 28 | CDU: 27, 271, 272, 273, 274, 275, 276, 277, 278, 279
                'Outras religiões',                         // CDD: 29 | CDU: 21, 22, 23, 24, 25, 26, 28, 29
            ],
        ],
        [
            'codigo' => 3,
            'nome' => 'Ciências Sociais',
            'subareas' => [
                'Sociologia e antropologia',                // CDD: 30 | CDU: 30, 31, 316
                'Estatística',                              // CDD: 31 | CDU: 311
                'Ciência política',                         // CDD: 32 | CDU: 32
                'Economia',                                 // CDD: 33 | CDU: 33
                'Direito',                                  // CDD: 34 | CDU: 34
                'Administração pública e assuntos militares', // CDD: 35 | CDU: 35
                'Problemas e serviços sociais',             // CDD: 36 | CDU: 36
                'Educação',                                 // CDD: 37 | CDU: 37
                'Comércio, comunicações e transportes',     // CDD: 38 | CDU: 339, 656
                'Costumes, etiqueta e folclore',            // CDD: 39 | CDU: 39
            ],
        ],
        [
            'codigo' => 4,
            'nome' => 'Linguagem',
            'subareas' => [
                'Linguagem geral',                          // CDD: 40 | CDU: 81
                'Linguística',                              // CDD: 41 | CDU: 81'1
                'Inglês',                                   // CDD: 42 | CDU: 811.111
                'Alemão e línguas germânicas',              // CDD: 43 | CDU: 811.11
                'Francês',                                  // CDD: 44 | CDU: 811.133.1
                'Italiano e romeno',                        // CDD: 45 | CDU: 811.131.1, 811.135.1
                'Espanhol e português',                     // CDD: 46 | CDU: 811.134.2, 811.134.3
                'Latim',                                    // CDD: 47 | CDU: 811.124
                'Grego',                                    // CDD: 48 | CDU: 811.14
                'Outras línguas',                           // CDD: 49 | CDU: 811
            ],
        ],
        [
            'codigo' => 5,
            'nome' => 'Ciências Naturais e Matemática',
            'subareas' => [
                'Ciências gerais',                          // CDD: 50 | CDU: 50
                'Matemática',                               // CDD: 51 | CDU: 51
                'Astronomia',                               // CDD: 52 | CDU: 52
                'Física',                                   // CDD: 53 | CDU: 53
                'Química',                                  // CDD: 54 | CDU: 54
                'Geociências',                              // CDD: 55 | CDU: 55
                'Paleontologia',                            // CDD: 56 | CDU: 56
                'Biologia',                                 // CDD: 57 | CDU: 57
                'Botânica',                                 // CDD: 58 | CDU: 58
                'Zoologia',                                 // CDD: 59 | CDU: 59
            ],
        ],
        [
            'codigo' => 6,
            'nome' => 'Tecnologia e Ciências Aplicadas',
            'subareas' => [
                'Tecnologia geral',                         // CDD: 60 | CDU: 6, 60
                'Medicina e saúde',                         // CDD: 61 | CDU: 61
                'Engenharia',                               // CDD: 62 | CDU: 62
                'Agricultura',                              // CDD: 63 | CDU: 63
                'Economia doméstica',                       // CDD: 64 | CDU: 64
                'Gestão e administração de empresas',       // CDD: 65 | CDU: 65
                'Engenharia química',                       // CDD: 66 | CDU: 66
                'Manufatura',                               // CDD: 67 | CDU: 67
                'Produtos manufaturados',                   // CDD: 68 | CDU: 68
                'Construção civil',                         // CDD: 69 | CDU: 69
            ],
        ],
        [
            'codigo' => 7,
            'nome' => 'Artes e Lazer',
            'subareas' => [
                'Artes geral',                              // CDD: 70 | CDU: 7, 70
                'Urbanismo e paisagismo',                   // CDD: 71 | CDU: 71
                'Arquitetura',                              // CDD: 72 | CDU: 72
                'Escultura e artes plásticas',              // CDD: 73 | CDU: 73
                'Desenho e artes decorativas',              // CDD: 74 | CDU: 74
                'Pintura',                                  // CDD: 75 | CDU: 75
                'Gravura e artes gráficas',                 // CDD: 76 | CDU: 76
                'Fotografia',                               // CDD: 77 | CDU: 77
                'Música',                                   // CDD: 78 | CDU: 78
                'Esportes, jogos e entretenimento',         // CDD: 79 | CDU: 79
            ],
        ],
        [
            'codigo' => 8,
            'nome' => 'Literatura',
            'subareas' => [
                'Teoria literária geral',                   // CDD: 80 | CDU: 82
                'Literatura norte-americana',               // CDD: 81 | CDU: 821.111(73)
                'Literatura inglesa',                       // CDD: 82 | CDU: 821.111
                'Literatura alemã',                         // CDD: 83 | CDU: 821.112.2
                'Literatura francesa',                      // CDD: 84 | CDU: 821.133.1
                'Literatura italiana',                      // CDD: 85 | CDU: 821.131.1
                'Literatura espanhola e portuguesa',        // CDD: 86 | CDU: 821.134.2, 821.134.3
                'Literatura latina',                        // CDD: 87 | CDU: 821.124
                'Literatura grega',                         // CDD: 88 | CDU: 821.14
                'Outras literaturas',                       // CDD: 89 | CDU: 821
            ],
        ],
        [
            'codigo' => 9,
            'nome' => 'História e Geografia',
            'subareas' => [
                'História geral',                           // CDD: 90 | CDU: 9, 93, 94
                'Geografia e viagens',                      // CDD: 91 | CDU: 91
                'Biografia e genealogia',                   // CDD: 92 | CDU: 929
                'História antiga',                          // CDD: 93 | CDU: 94(3)
                'História da Europa',                       // CDD: 94 | CDU: 94(4)
                'História da Ásia',                         // CDD: 95 | CDU: 94(5)
                'História da África',                       // CDD: 96 | CDU: 94(6)
                'História da América do Norte',             // CDD: 97 | CDU: 94(7)
                'História da América do Sul',               // CDD: 98 | CDU: 94(8)
                'Oceania e regiões polares',                // CDD: 99 | CDU: 94(9)
            ],
        ],
    ];

    public function run(AreaService $service): void
    {
        $service->inserir(self::DADOS);
    }
}
