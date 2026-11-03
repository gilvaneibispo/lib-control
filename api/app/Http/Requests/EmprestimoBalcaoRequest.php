<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmprestimoBalcaoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'exemplar_id' => ['required', 'integer', 'exists:exemplares,id'],
        ];
    }
}
