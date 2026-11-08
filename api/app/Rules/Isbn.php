<?php

namespace App\Rules;

use App\Helpers\IsbnHelper as Helper;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Isbn implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || !Helper::valido($value)) {
            $fail('O ISBN informado é inválido.');
        }
    }
}
