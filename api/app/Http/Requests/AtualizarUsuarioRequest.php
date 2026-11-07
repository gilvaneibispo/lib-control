<?php

namespace App\Http\Requests;

use App\Http\Requests\EnderecoRegras;
use App\Rules\Cpf;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizarUsuarioRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $dados = [];

        foreach (['cpf', 'cep'] as $campo) {
            if ($this->has($campo)) {
                $dados[$campo] = preg_replace('/\D/', '', (string) $this->input($campo));
            }
        }

        if ($this->has('uf')) {
            $dados['uf'] = strtoupper((string) $this->input('uf'));
        }

        if ($this->has('numero')) {
            $dados['numero'] = strtoupper(trim((string) $this->input('numero')));
        }

        $this->merge($dados);
    }

    public function rules(): array
    {
        $usuario = $this->route('usuario');

        $emailUnico = Rule::unique('usuarios', 'email')->ignore($usuario->id);
        $cpfUnico = Rule::unique('usuarios', 'cpf')->ignore($usuario->id);

        $pessoal = [
            'nome' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => ['sometimes', 'required', 'email', 'max:255', $emailUnico],
            'cpf' => ['sometimes', 'required', 'digits:11', new Cpf, $cpfUnico],
            'data_nascimento' => ['sometimes', 'required', 'date', 'before:today'],
        ];

        return array_merge($pessoal, EnderecoRegras::regras(obrigatorio: false));
    }
}
