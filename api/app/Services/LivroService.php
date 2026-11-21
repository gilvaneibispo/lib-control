<?php

namespace App\Services;

use App\Models\Livro;

class LivroService
{
    private const POR_PAGINA_DEFAULT = 10;

    /** Busca os livros do banco e constrói a listagem **/
    public function listar($termo, $porPagina = null)
    {
        $query = Livro::query();

        // Se tiver termo de busca aplica...
        if ($termo != '') {
            $query->where(function ($busca) use ($termo) {
                self::filtrarPorTermo($busca, $termo);
            });
        }

        // Mais recentes primeiro...
        return $query
            ->latest('id')
            ->paginate($porPagina ?? self::POR_PAGINA_DEFAULT)
            ->withQueryString();
    }

    public static function filtrarPorTermo($query, $termo)
    {
        $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $termo) . '%';
        $isbn = preg_replace('/[^0-9Xx]/', '', $termo);

        // Filtro por título, subtítulo e autores...
        $query
            ->where('titulo', 'ilike', $like)
            ->orWhere('subtitulo', 'ilike', $like)
            ->orWhere('autores', 'ilike', $like);

        // Filtro por trecho do ISBN...
        if (strlen($isbn) >= 4) {
            $query->orWhere('isbn', 'like', '%' . strtoupper($isbn) . '%');
        }
    }

    public function criar($dados)
    {
        return Livro::create($dados);
    }

    public function atualizar(Livro $livro, $dados)
    {
        $livro->update($dados);

        return $livro;
    }

    public function excluir(Livro $livro)
    {
        $livro->delete();
    }
}
