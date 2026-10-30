<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

final class EnderecoRegras
{

    public const TODAS = [
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO',
    ];

    public static function regras(bool $obrigatorio = true): array
    {
        $req = $obrigatorio ? 'required' : 'sometimes';

        return [
            'cep' => [$req, 'digits:8'],
            'uf' => [$req, Rule::in(self::TODAS)],
            'cidade' => [$req, 'string', 'max:100'],
            'bairro' => [$req, 'string', 'max:100'],
            'rua' => [$req, 'string', 'max:150'],
            'numero' => [$req, 'string', 'max:10', 'regex:/^(\d+[A-Za-z]?|S\/N)$/i'],
            'complemento' => ['nullable', 'string', 'max:100'],
        ];
    }
}
