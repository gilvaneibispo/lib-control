<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse as Json;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\Usuario;
use App\Http\Resources\UsuarioResource;
use App\Http\Requests\RegistrarRequest as RegistrarReq;

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

    private function regenerar(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }
}
