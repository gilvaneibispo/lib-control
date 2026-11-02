<?php

namespace App\Console\Commands;

use App\Services\AdminService;
use Illuminate\Console\Command;
use Illuminate\Validation\ValidationException;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CriarAdmin extends Command
{
    protected $signature = 'lib-control:criar-admin';

    protected $description = 'Cria um usuário administrador (bibliotecária)';

    public function handle(AdminService $service): int
    {
        $dados = [
            'nome' => text('Nome', required: true),
            'email' => text('E-mail', required: true),
            'password' => password('Senha', required: true),
            'password_confirmation' => password('Confirme a senha', required: true),
            'cpf' => text('CPF', required: true),
            'data_nascimento' => text('Data de nascimento', placeholder: 'AAAA-MM-DD', required: true),
            'cep' => text('CEP', required: true),
            'uf' => text('UF', required: true),
            'cidade' => text('Cidade', required: true),
            'bairro' => text('Bairro', required: true),
            'rua' => text('Rua', required: true),
            'numero' => text('Número', hint: 'Use S/N se não houver', required: true),
            'complemento' => text('Complemento (opcional)') ?: null,
        ];

        try {
            $admin = $service->criar($dados);
        } catch (ValidationException $e) {
            foreach ($e->validator->errors()->all() as $erro) {
                $this->error($erro);
            }

            return self::FAILURE;
        }

        $this->info("Admin {$admin->nome} <{$admin->email}> criado com sucesso.");

        return self::SUCCESS;
    }
}
