<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReservarRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'livro_id' => ['required', 'integer', Rule::exists('livros', 'id')->whereNull('deleted_at')],
        ];
    }
}
