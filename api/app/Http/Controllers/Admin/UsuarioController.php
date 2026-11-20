<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Enums\Papel;
use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Rules\Cpf;
use App\Services\UsuarioService;

class UsuarioController extends Controller
{
    private $usuarios;

    public function __construct(UsuarioService $usuarios)
    {
        $this->usuarios = $usuarios;
    }

    /** Lista todos os usuários **/
    public function index(Request $request)
    {
        $termo = trim($request->input('q', ''));

        $usuarios = $this->usuarios->listar(
            $termo,
            $request->input('papel')
        );

        return $this->paginado($usuarios);
    }

    /** Lista usuário específico **/
    public function show(Usuario $usuario)
    {
        return $this->responder(['data' => $usuario->formatar()]);
    }

    public function update(Request $request, Usuario $usuario)
    {

        // Se tiver CPF, obtem apenas os números...
        if ($request->has('cpf')) {
            $request->merge([
                'cpf' => preg_replace('/\D/', '', $request->input('cpf'))
            ]);
        }

        // Se tiver CEP, obtem apenas os números...
        if ($request->has('cep')) {
            $request->merge(['cep' => preg_replace('/\D/', '', $request->input('cep'))]);
        }

        if ($request->has('uf')) {
            $request->merge(['uf' => strtoupper($request->input('uf'))]);
        }

        if ($request->has('numero')) {
            $request->merge(['numero' => strtoupper(trim($request->input('numero')))]);
        }

        // Dados completos com endereço...
        $dados = $request->validate([
            'nome' => 'sometimes|required',
            'email' => 'sometimes|required|email|unique:usuarios,email,' . $usuario->id,
            'cpf' => ['sometimes', 'required', 'digits:11', new Cpf(), 'unique:usuarios,cpf,' . $usuario->id],
            'nascimento' => 'sometimes|required|date',
            'cep' => 'sometimes|digits:8',
            'uf' => 'sometimes|size:2',
            'cidade' => 'sometimes',
            'bairro' => 'sometimes',
            'rua' => 'sometimes',
            'numero' => 'sometimes',
            'complemento' => 'nullable',
        ]);

        $usuario->update($dados);

        return $this->responder(['data' => $usuario->formatar()]);
    }

    /** Promove o usuário a admin **/
    public function tornarAdmin(Usuario $usuario)
    {
        if (!$usuario->isAdmin()) {
            $usuario->forceFill(['papel' => Papel::Admin])->save();
        }

        return $this->responder(['data' => $usuario->formatar()]);
    }
}
