<?php

namespace Database\Seeders;

use App\Enums\StatusExemplar;
use App\Models\Autor;
use App\Models\Exemplar;
use App\Models\Livro;
use App\Models\Subarea;
use App\Services\LivroService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class LivroSeeder extends Seeder
{
    private const DADOS = [
        [
            'titulo' => 'Código Limpo',
            'subtitulo' => 'Habilidades práticas do Agile Software',
            'autores' => ['Robert C. Martin'],
            'editora' => 'Alta Books',
            'ano' => 2009,
            'cdd' => '005.1',
            'cdu' => '004.41',
            'area' => 0,
            'subarea' => 'Computação e informática',
            'exemplares' => 8,
            'disponivel' => true,
            'sinopse' => 'Princípios e práticas para escrever código legível, fácil de manter e de evoluir.',
        ],
        [
            'titulo' => 'A Biblioteca à Noite',
            'subtitulo' => null,
            'autores' => ['Alberto Manguel'],
            'editora' => 'Companhia das Letras',
            'ano' => 2006,
            'cdd' => '027',
            'cdu' => '027',
            'area' => 0,
            'subarea' => 'Biblioteconomia e ciência da informação',
            'exemplares' => 2,
            'disponivel' => false,
            'sinopse' => 'Ensaio sobre as bibliotecas como espaço, ordem, memória e identidade ao longo da história.',
        ],
        [
            'titulo' => 'O Mundo de Sofia',
            'subtitulo' => 'Romance da história da filosofia',
            'autores' => ['Jostein Gaarder'],
            'editora' => 'Companhia das Letras',
            'ano' => 1995,
            'cdd' => '100',
            'cdu' => '1',
            'area' => 1,
            'subarea' => 'Filosofia geral',
            'exemplares' => 12,
            'disponivel' => true,
            'sinopse' => 'Uma adolescente recebe cartas misteriosas que a conduzem por um curso de filosofia, dos pré-socráticos aos dias atuais.',
        ],
        [
            'titulo' => 'Rápido e Devagar',
            'subtitulo' => 'Duas formas de pensar',
            'autores' => ['Daniel Kahneman'],
            'editora' => 'Objetiva',
            'ano' => 2012,
            'cdd' => '153.4',
            'cdu' => '159.95',
            'area' => 1,
            'subarea' => 'Psicologia',
            'exemplares' => 5,
            'disponivel' => true,
            'sinopse' => 'Os dois sistemas que guiam o pensamento humano e os vieses que afetam nossas decisões.',
        ],
        [
            'titulo' => 'O Poder do Mito',
            'subtitulo' => null,
            'autores' => ['Joseph Campbell', 'Bill Moyers'],
            'editora' => 'Palas Athena',
            'ano' => 1990,
            'cdd' => '201.3',
            'cdu' => '2-1',
            'area' => 2,
            'subarea' => 'Filosofia e teoria da religião',
            'exemplares' => 3,
            'disponivel' => true,
            'sinopse' => 'Diálogos sobre o papel dos mitos e dos símbolos religiosos na experiência humana.',
        ],
        [
            'titulo' => 'As Religiões do Mundo',
            'subtitulo' => 'Nossas grandes tradições de sabedoria',
            'autores' => ['Huston Smith'],
            'editora' => 'Cultrix',
            'ano' => 1991,
            'cdd' => '200',
            'cdu' => '2',
            'area' => 2,
            'subarea' => 'Religião geral',
            'exemplares' => 1,
            'disponivel' => false,
            'sinopse' => 'Panorama das principais tradições religiosas do mundo e de seus ensinamentos centrais.',
        ],
        [
            'titulo' => 'O Capital no Século XXI',
            'subtitulo' => null,
            'autores' => ['Thomas Piketty'],
            'editora' => 'Intrínseca',
            'ano' => 2014,
            'cdd' => '332',
            'cdu' => '330',
            'area' => 3,
            'subarea' => 'Economia',
            'exemplares' => 4,
            'disponivel' => true,
            'sinopse' => 'Análise histórica da concentração de renda e de riqueza nos países desenvolvidos.',
        ],
        [
            'titulo' => 'Pedagogia do Oprimido',
            'subtitulo' => null,
            'autores' => ['Paulo Freire'],
            'editora' => 'Paz e Terra',
            'ano' => 1970,
            'cdd' => '370.1',
            'cdu' => '37',
            'area' => 3,
            'subarea' => 'Educação',
            'exemplares' => 15,
            'disponivel' => true,
            'sinopse' => 'Proposta de uma educação dialógica e libertadora, construída com o educando e não para ele.',
        ],
        [
            'titulo' => 'Gramática Escolar da Língua Portuguesa',
            'subtitulo' => null,
            'autores' => ['Evanildo Bechara'],
            'editora' => 'Nova Fronteira',
            'ano' => 2010,
            'cdd' => '469.5',
            'cdu' => '811.134.3',
            'area' => 4,
            'subarea' => 'Espanhol e português',
            'exemplares' => 10,
            'disponivel' => true,
            'sinopse' => 'Gramática de referência da língua portuguesa voltada aos estudantes.',
        ],
        [
            'titulo' => 'Preconceito Linguístico',
            'subtitulo' => 'O que é, como se faz',
            'autores' => ['Marcos Bagno'],
            'editora' => 'Parábola',
            'ano' => 1999,
            'cdd' => '410',
            'cdu' => "81'1",
            'area' => 4,
            'subarea' => 'Linguística',
            'exemplares' => 3,
            'disponivel' => false,
            'sinopse' => 'Discussão sobre os mitos que sustentam o preconceito contra as variedades do português brasileiro.',
        ],
        [
            'titulo' => 'Uma Breve História do Tempo',
            'subtitulo' => null,
            'autores' => ['Stephen Hawking'],
            'editora' => 'Intrínseca',
            'ano' => 2015,
            'cdd' => '523.1',
            'cdu' => '52',
            'area' => 5,
            'subarea' => 'Astronomia',
            'exemplares' => 6,
            'disponivel' => true,
            'sinopse' => 'Do Big Bang aos buracos negros, uma introdução acessível às grandes questões da cosmologia.',
        ],
        [
            'titulo' => 'A Origem das Espécies',
            'subtitulo' => null,
            'autores' => ['Charles Darwin'],
            'editora' => 'Martin Claret',
            'ano' => 2014,
            'cdd' => '576.8',
            'cdu' => '57',
            'area' => 5,
            'subarea' => 'Biologia',
            'exemplares' => 2,
            'disponivel' => true,
            'sinopse' => 'A obra que apresentou a teoria da evolução por seleção natural.',
        ],
        [
            'titulo' => 'O Gene',
            'subtitulo' => 'Uma história íntima',
            'autores' => ['Siddhartha Mukherjee'],
            'editora' => 'Companhia das Letras',
            'ano' => 2016,
            'cdd' => '616.042',
            'cdu' => '61',
            'area' => 6,
            'subarea' => 'Medicina e saúde',
            'exemplares' => 7,
            'disponivel' => true,
            'sinopse' => 'A história da genética e de suas implicações para a medicina e para a identidade humana.',
        ],
        [
            'titulo' => 'A Meta',
            'subtitulo' => 'Um processo de melhoria contínua',
            'autores' => ['Eliyahu M. Goldratt', 'Jeff Cox'],
            'editora' => 'Nobel',
            'ano' => 2002,
            'cdd' => '658.5',
            'cdu' => '65',
            'area' => 6,
            'subarea' => 'Gestão e administração de empresas',
            'exemplares' => 9,
            'disponivel' => true,
            'sinopse' => 'Romance de negócios que apresenta a teoria das restrições na gestão de uma fábrica.',
        ],
        [
            'titulo' => 'A História da Arte',
            'subtitulo' => null,
            'autores' => ['E. H. Gombrich'],
            'editora' => 'LTC',
            'ano' => 1999,
            'cdd' => '709',
            'cdu' => '7',
            'area' => 7,
            'subarea' => 'Artes geral',
            'exemplares' => 1,
            'disponivel' => true,
            'sinopse' => 'Uma das introduções mais conhecidas à história da arte, das pinturas rupestres à arte moderna.',
        ],
        [
            'titulo' => 'Uma Breve História da Música',
            'subtitulo' => null,
            'autores' => ['Roy Bennett'],
            'editora' => 'Zahar',
            'ano' => 1986,
            'cdd' => '780.9',
            'cdu' => '78',
            'area' => 7,
            'subarea' => 'Música',
            'exemplares' => 4,
            'disponivel' => true,
            'sinopse' => 'Os principais períodos, estilos e compositores da música ocidental.',
        ],
        [
            'titulo' => 'Dom Casmurro',
            'subtitulo' => null,
            'autores' => ['Machado de Assis'],
            'editora' => 'Penguin-Companhia',
            'ano' => 2016,
            'cdd' => '869.3',
            'cdu' => '821.134.3',
            'area' => 8,
            'subarea' => 'Literatura espanhola e portuguesa',
            'exemplares' => 14,
            'disponivel' => true,
            'sinopse' => 'Bentinho revisita a própria vida e o ciúme que sente de Capitu, sua amiga de infância e esposa.',
        ],
        [
            'titulo' => 'Orgulho e Preconceito',
            'subtitulo' => null,
            'autores' => ['Jane Austen'],
            'editora' => 'Penguin-Companhia',
            'ano' => 2011,
            'cdd' => '823',
            'cdu' => '821.111',
            'area' => 8,
            'subarea' => 'Literatura inglesa',
            'exemplares' => 11,
            'disponivel' => true,
            'sinopse' => 'Elizabeth Bennet e o Sr. Darcy superam o orgulho e os preconceitos de uma sociedade de aparências.',
        ],
        [
            'titulo' => 'Sapiens',
            'subtitulo' => 'Uma breve história da humanidade',
            'autores' => ['Yuval Noah Harari'],
            'editora' => 'L&PM',
            'ano' => 2015,
            'cdd' => '909',
            'cdu' => '94',
            'area' => 9,
            'subarea' => 'História geral',
            'exemplares' => 13,
            'disponivel' => true,
            'sinopse' => 'Da revolução cognitiva aos dias atuais, como o Homo sapiens passou a dominar o planeta.',
        ],
        [
            'titulo' => 'Os Sertões',
            'subtitulo' => 'Campanha de Canudos',
            'autores' => ['Euclides da Cunha'],
            'editora' => 'Ubu',
            'ano' => 2019,
            'cdd' => '981.42',
            'cdu' => '94(8)',
            'area' => 9,
            'subarea' => 'História da América do Sul',
            'exemplares' => 2,
            'disponivel' => false,
            'sinopse' => 'Relato da Guerra de Canudos, com a descrição da terra, do homem e da luta no sertão baiano.',
        ],
    ];

    public function run(LivroService $livros): void
    {
        DB::transaction(function () use ($livros) {
            foreach (self::DADOS as $dados) {
                if (Livro::query()->where('titulo', $dados['titulo'])->exists()) {
                    continue;
                }

                $subarea = Subarea::query()
                    ->where('nome', $dados['subarea'])
                    ->whereHas('area', fn ($q) => $q->where('codigo', $dados['area']))
                    ->firstOrFail();

                $livro = $livros->criar([
                    ...Arr::only($dados, ['titulo', 'subtitulo', 'editora', 'ano', 'cdd', 'cdu', 'sinopse']),
                    'area_id' => $subarea->area_id,
                    'subarea_id' => $subarea->id,
                    'quantidade_exemplares' => $dados['exemplares'],
                ]);

                foreach ($dados['autores'] as $ordem => $nome) {
                    $autor = Autor::query()->firstOrCreate(['nome' => $nome]);
                    $livro->autores()->attach($autor->id, ['ordem' => $ordem]);
                }

                if (!$dados['disponivel']) {
                    Exemplar::query()
                        ->where('livro_id', $livro->id)
                        ->update(['status' => StatusExemplar::Indisponivel->value]);
                }
            }
        });
    }
}
