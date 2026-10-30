<?php

namespace App\Rules;

use App\Helpers\CpfHelper as Helper;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Cpf implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || !Helper::valido($value)) {
            $fail('O CPF informado é inválido.');
        }
    }
}
