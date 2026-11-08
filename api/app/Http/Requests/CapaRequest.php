<?php

namespace App\Http\Requests;

use App\Enums\OrigemCapa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CapaRequest extends FormRequest
{
    public function rules(): array
    {
        $tamanhoMaximo = config('lib-control.uploads.capa_max_kb');

        $origensRemotas = [
            OrigemCapa::BrasilApi->value,
            OrigemCapa::OpenLibrary->value,
            OrigemCapa::Google->value,
        ];

        return [
            'capa' => [
                'required_without:url',
                'image',
                'mimes:jpg,jpeg,png',
                'max:' . $tamanhoMaximo,
            ],
            'url' => ['required_without:capa', 'url:http,https', 'max:2048'],
            'origem' => ['required_with:url', Rule::in($origensRemotas)],
        ];
    }
}
