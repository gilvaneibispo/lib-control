<?php

namespace Database\Seeders;

use App\Enums\Papel;
use App\Models\Usuario;
use App\Services\AdminService;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    private const DADOS = [
        'nome' => 'Gilvanei Admin',
        'email' => 'gilvanei.admin@email.com',
        'password' => 'senha123',
        'password_confirmation' => 'senha123',
        'cpf' => '178.392.700-34',
        'data_nascimento' => '1989-03-13',
        'cep' => '440.330-22',
        'uf' => 'BA',
        'cidade' => 'Feira de Santana',
        'bairro' => 'Campo Limpo',
        'rua' => 'Primavera',
        'numero' => '333',
    ];

    public function run(AdminService $service): void
    {
        $existente = Usuario::where('email', self::DADOS['email'])->first();

        if ($existente) {
            if (!$existente->isAdmin()) {
                $existente->forceFill(['papel' => Papel::Admin])->save();
                $this->command?->warn("Usuário {$existente->email} já existia e foi promovido a admin.");
            }

            return;
        }

        $service->criar(self::DADOS);
    }
}
