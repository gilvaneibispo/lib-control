<?php

namespace App\Services;

use App\Enums\FakeTemp;
use App\Enums\Papel;
use App\Http\Requests\RegistrarRequest;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class AdminService
{
    public function criar(array $dados): Usuario
    {
        $dadosValidos = $this->validar($dados);

        return DB::transaction(function () use ($dadosValidos) {
            $admin = Usuario::create($dadosValidos);
            $admin->forceFill([
                'papel' => Papel::Admin,
                'foto_path' => FakeTemp::USUARIO_FOTO_PERFIL_PATH->value,
            ])->save();

            return $admin;
        });
    }

    private function validar(array $dados): array
    {
        $request = RegistrarRequest::createFrom(Request::create('/', 'POST', $dados));
        $request->setContainer(app())->setRedirector(app('redirect'));
        $request->validateResolved();

        return $request->safe()->except(['foto', 'password_confirmation']);
    }
}
