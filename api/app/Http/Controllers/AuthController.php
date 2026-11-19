<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Exceptions\ErroException;
use App\Enums\CodigoErro;
use App\Enums\Papel;
use App\Rules\Cpf;
use App\Services\UsuarioService;

class AuthController extends Controller
{

    private const PAPEL_PADRAO_USUARIO = 'leitor';

    public function registrar(Request $request, UsuarioService $usuarios)
    {
        $request->merge([
            'cpf' => preg_replace('/\D/', '', $request->input('cpf')),
            'cep' => preg_replace('/\D/', '', $request->input('cep')),
            'email' => strtolower(trim($request->input('email'))),
            'uf' => strtoupper($request->input('uf')),
            'numero' => strtoupper(trim($request->input('numero'))),
        ]);

        $dados = $request->validate([
            'nome' => 'required',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|confirmed|min:8',
            'cpf' => ['required', 'digits:11', new Cpf(), 'unique:usuarios,cpf'],
            'nascimento' => 'required|date|before:today',
            'cep' => 'required|digits:8',
            'uf' => 'required|size:2',
            'cidade' => 'required',
            'bairro' => 'required',
            'rua' => 'required',
            'numero' => 'required',
            'complemento' => 'nullable',
        ]);

        $user = $usuarios->registrar($dados);

        Auth::guard('web')->login($user);
        $this->regenerar($request);

        return response()->json(['data' => $user->formatar()], 201);
    }

    public function login(Request $request)
    {        
        
        $request->validate([
            'email' => 'required',
            'password' => 'required',
            'acesso' => 'required',
        ]);

        // Email sempre com letras minúscolas e sem espaços nas bordas... 
        $credenciais = [
            'email' => strtolower(trim($request->input('email'))),
            'password' => $request->input('password'),
        ];

        $user = $this->validarLogin(
            $credenciais,
            $request->input('acesso'),
            $request->boolean('lembrar')
        );
        
        $this->regenerar($request);

        return response()->json([
            'data' => $user->formatar()
        ], 201);
    }

    private function validarLogin($credenciais, $acesso, $lembrar = false, )
    {
        // Papel default...
        $papel = self::PAPEL_PADRAO_USUARIO;
        
        if (!Auth::guard('web')->attempt($credenciais, $lembrar)) {
            throw new ErroException(CodigoErro::CredenciaisInvalidas);
        }

        if ($acesso == Papel::Admin->value) {
            $papel = Papel::Admin->value;
        }

        $user = Auth::guard('web')->user();

        // Mata o progresso caso o papel informado não seja o mesmo do sistema...
        if ($user->papel->value != $papel) {
            Auth::guard('web')->logout();
            throw new ErroException(CodigoErro::PapelIncompativel);
        }

        return $user;
    }

    /** Mata a sessão atual, se existir, quando invocada. **/
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'mensagem' => 'Sessão encerrada.'
        ]);
    }

    /** Obtem os dados do usuário logado. **/
    public function obterUsuarioLogado(Request $request)
    {
        $user = Auth::guard('web')->user();

        return response()->json(['data' => $user->formatar()]);
    }

    /** Gera novos dados para a sessão. **/
    private function regenerar($request)
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }
}
