<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExemplarRequest extends FormRequest
{
    public function rules(): array
    {
        $exemplar = $this->route('exemplar');

        return [
            'codigo' => ['sometimes', 'required', 'string', 'max:40', Rule::unique('exemplares', 'codigo')->ignore($exemplar->id)],
            'status' => ['sometimes', 'required', Rule::in(['disponivel', 'indisponivel'])],
            'observacao' => ['nullable', 'string', 'max:255'],
        ];
    }
}
