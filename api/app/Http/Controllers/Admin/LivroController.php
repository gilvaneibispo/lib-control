<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Models\Livro;
use App\Services\LivroService;

class LivroController extends Controller
{
    private $livros;

    private const CAMPOS_INPUT_HIGIENIZAR = ['cdd', 'cdu', 'autores', 'capa_url'];
    private const MAPA_VALIDACAO_INPUTS = [
        'titulo' => ['required', 'string', 'max:255'],
        'subtitulo' => ['nullable', 'string', 'max:255'],
        'isbn' => ['nullable', 'string', 'unique:livros,isbn{{livro_id}}'],
        'ano' => ['nullable', 'integer'],
        'editora' => ['nullable', 'string', 'max:150'],
        'sinopse' => ['nullable', 'string', 'max:10000'],
        'cdd' => ['nullable', 'string', 'max:40'],
        'cdu' => ['nullable', 'string', 'max:80'],
        'autores' => ['nullable', 'string', 'max:1000'],
        'capa_url' => ['nullable', 'url:http,https', 'max:2048'],
    ];

    private const MENSAGEM_ERRO_ISBN_EXISTENTE = "Já existe um livro cadastrado com este ISBN.";
    private const MENSAGEM_ERRO_ISBN_TAMANHO = "O ISBN deve ter 10 ou 13 dígitos.";

    public function __construct(LivroService $livros)
    {
        $this->livros = $livros;
    }

    private function higienizarCampos(Request $request, array $campos): Request
    {
        
        // Remove espaços das pontas; vazio vira null...
        foreach ($campos as $campo) {
            if (is_string($request->input($campo))) {
                $valor = trim($request->input($campo));
                $request->merge([
                    $campo => $valor === '' ? null : $valor
                ]);
            }
        }

        return $request;
    }

    /** Lista os livros, mais recentes primeiro **/
    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:200'],
            'por-pagina' => ['nullable', 'integer', 'min:1'],
        ]);

        // Se a listagem tiver filtros...
        $termo = trim($request->input('q', ''));
        $porPagina = $request->filled('por-pagina') ? (int) $request->input('por-pagina') : null;

        $livros = $this->livros->listar($termo, $porPagina);
        return $this->paginado($livros);
    }

    private function tratarInputs(Request $request, string $id = '')
    {
        
        $validado = $this->higienizarCampos(
            $request,
            self::CAMPOS_INPUT_HIGIENIZAR
        );

        // Adiciona, se necessário, o id do livro entre os
        // crítérios de validação do ISBN...
        $indexId = 2;
        $campos = self::MAPA_VALIDACAO_INPUTS;
        $campos['isbn'][$indexId] = str_replace(
            '{{livro_id}}',
            $id === '' ? '' : ',' . $id,
            $campos['isbn'][$indexId]
        );

        // valida os campos básicos necessários...
        return $validado->validate($campos, [
            'isbn.unique' => self::MENSAGEM_ERRO_ISBN_EXISTENTE,
            'isbn.regex' => self::MENSAGEM_ERRO_ISBN_TAMANHO,
        ]);
    }

    /** Cadastra um livro novo **/
    public function store(Request $request)
    {

        // Remove espaços das pontas; vazio vira null...
        // foreach (['cdd', 'cdu', 'autores', 'capa_url'] as $campo) {
        //     if (is_string($request->input($campo))) {
        //         $valor = trim($request->input($campo));
        //         $request->merge([
        //             $campo => $valor === '' ? null : $valor
        //         ]);
        //     }
        // }

        $dados = $this->tratarInputs($request);
        $livro = $this->livros->criar($dados);

        return $this->responder(
            ['data' => $livro->formatar()],
            201
        );
    }

    /** Mostra um livro específico **/
    public function show(Livro $livro)
    {
        return $this->responder([
            'data' => $livro->formatar()
        ]);
    }

    /** Atualiza um livro **/
    public function update(Request $request, Livro $livro)
    {

        $dados = $this->tratarInputs($request, $livro->id);
        $livro = $this->livros->atualizar($livro, $dados);

        return $this->responder([
            'data' => $livro->formatar()
        ]);
    }

    /** Exclui um livro **/
    public function destroy(Livro $livro)
    {
        $this->livros->excluir($livro);

        return $this->responder([
            'mensagem' => "Livro excluido com sucesso!"
        ], 204);
    }
}
