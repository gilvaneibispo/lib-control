<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MotivoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'motivo' => ['required', 'string', 'min:3', 'max:255'],
        ];
    }
}
