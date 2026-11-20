<?php

namespace App\Http\Controllers;

abstract class Controller
{

    /** Padroniza a paginação com dados, links e metadados **/
    protected function paginado($paginacao, $extra = [])
    {
        $itens = [];

        foreach ($paginacao->items() as $item) {
            $itens[] = $item->formatar();
        }

        $todos = $paginacao->toArray();

        $resposta = [
            'data' => $itens,
            'links' => [
                'first' => $todos['first_page_url'],
                'last' => $todos['last_page_url'],
                'prev' => $todos['prev_page_url'],
                'next' => $todos['next_page_url'],
            ],
            'meta' => [
                'current_page' => $todos['current_page'],
                'from' => $todos['from'],
                'last_page' => $todos['last_page'],
                'links' => $todos['links'],
                'path' => $todos['path'],
                'per_page' => $todos['per_page'],
                'to' => $todos['to'],
                'total' => $todos['total'],
            ],
        ];

        return response()->json(array_merge($resposta, $extra));
    }

    /** Padroniza o retorno HTTP **/
    protected function responder(array $dados, $codigo = 200)
    {
        return response()->json($dados, $codigo);
    }
}
