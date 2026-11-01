<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse as Json;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\Usuario;
use App\Http\Resources\UsuarioResource;
use App\Http\Requests\RegistrarRequest as RegistrarReq;
use App\Http\Requests\LoginRequest;
use App\Exceptions\RegrasException;
use App\Enums\CodigoErro;
use App\Enums\Papel;

class AuthController extends Controller
{
    public function registrar(RegistrarReq $request): Json
    {
        $user = DB::transaction(function () use ($request) {
            $user = Usuario::create($request->safe()->except(['foto', 'password_confirmation']));
            $user->forceFill(['foto_path' => Usuario::FOTO_PERFIL_PADRAO])->save();

            return $user;
        });

        Auth::guard('web')->login($user);
        $this->regenerar($request);

        return (new UsuarioResource($user))->response()->setStatusCode(201);
    }

    public function login(LoginRequest $request): Json
    {
        $credenciais = $request->only('email', 'password');
        $credenciais['email'] = strtolower(trim((string) $credenciais['email']));

        if (!Auth::guard('web')->attempt(
            $credenciais,
            $request->boolean('lembrar')
        )) {
            throw new RegrasException(CodigoErro::CredenciaisInvalidas);
        }

        $user = Auth::guard('web')->user();
        $papel = $request->input('acesso') === Papel::Admin->value
            ? Papel::Admin
            : Papel::Leitor;

        if ($user->papel !== $papel) {
            Auth::guard('web')->logout();
            throw new RegrasException(CodigoErro::PapelIncompativel);
        }

        $this->regenerar($request);

        return (new UsuarioResource($user))->response()->setStatusCode(201);
    }

    public function logout(Request $request): Json
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['mensagem' => 'Sessão encerrada.']);
    }

    public function obterUsuarioLogado(Request $request): Json
    {
        $user = Auth::guard('web')->user();
        return (new UsuarioResource($user))->response();
    }

    private function regenerar(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }
}
