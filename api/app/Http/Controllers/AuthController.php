<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Exceptions\ErroException;
use App\Enums\CodigoErro;
use App\Enums\Papel;

class AuthController extends Controller
{

    private const PAPEL_PADRAO_USUARIO = 'leitor';
    
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

        $this->validarLogin(
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
