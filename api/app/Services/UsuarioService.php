<?php

namespace App\Services;

use App\Models\Usuario;

class UsuarioService
{
    private const POR_PAGINA = 10;

    /** Cria novo usuário **/
    public function registrar($dados)
    {
        return Usuario::create($dados);
    }

    /** Busca todos os usuários do banco e constrói a listagem **/
    public function listar($termo, $papel)
    {
        $query = Usuario::query();

        // Se tiver termo de busca aplica...
        if ($termo != '') {
            $query->where(function ($busca) use ($termo) {
                self::filtrarPorTermo($busca, $termo);
            });
        }

        // Filtra pelo papel quando esse é definido...
        if ($papel) {
            $query->where('papel', $papel);
        }

        // Ordena o retorno pelo nome dos usuários...
        return $query->orderBy('nome')
            ->paginate(self::POR_PAGINA)
            ->withQueryString();
    }

    public static function filtrarPorTermo($query, $termo)
    {
        $cpf = preg_replace('/\D/', '', $termo);

        // filtro por nome e email...
        $query
            ->where('nome', 'ilike', "%{$termo}%")
            ->orWhere('email', 'ilike', "%{$termo}%");

        // Filtro por trecho do CPF...
        if (strlen($cpf) >= 3) {
            $query->orWhere('cpf', 'like', "%{$cpf}%");
        }
    }
}
