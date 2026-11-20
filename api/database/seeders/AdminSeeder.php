<?php

namespace Database\Seeders;

use App\Enums\Papel;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    private const DADOS = [
        'nome' => 'Administrador Principal',
        'email' => 'admin@email.com',
        'password' => 'senha#123',
        'cpf' => '17839270034',
        'nascimento' => '1990-01-01',
        'cep' => '44033022',
        'uf' => 'BA',
        'cidade' => 'Feira de Santana',
        'bairro' => 'Centro',
        'rua' => 'Rua Principal',
        'numero' => '100',
    ];

    public function run(): void
    {
        // O email já foi cadastrado?
        $existente = Usuario::where('email', self::DADOS['email'])->first();

        // Se sim, apenas torna admin...
        if ($existente) {
            if (!$existente->isAdmin()) {
                $existente->forceFill(['papel' => Papel::Admin])->save();
                $this->command?->warn("Usuário {$existente->email} já existia e foi promovido a admin.");
            }

            return;
        }

        // Se não, já cria como admin...
        $admin = Usuario::create(self::DADOS);
        $admin->forceFill(['papel' => Papel::Admin])->save();
    }
}
