<?php

namespace App\Http\Requests;

use App\Http\Requests\EnderecoRegras;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Rules\Cpf;

class RegistrarRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'cpf' => preg_replace('/\D/', '', (string) $this->input('cpf')),
            'cep' => preg_replace('/\D/', '', (string) $this->input('cep')),
            'uf' => strtoupper((string) $this->input('uf')),
            'email' => strtolower(trim((string) $this->input('email'))),
            'numero' => strtoupper(trim((string) $this->input('numero'))),
        ]);
    }

    public function rules(): array
    {
        $pessoal = [
            'nome' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255', Rule::unique('usuarios', 'email')],
            'password' => ['required', 'confirmed', Password::min(8)],
            'cpf' => [
                'required',
                'digits:11',
                new Cpf,
                Rule::unique('usuarios', 'cpf')
            ],
            'data_nascimento' => ['required', 'date', 'before:today', 'after:1900-01-01']
        ];
        return array_merge($pessoal, EnderecoRegras::regras());
    }
}
