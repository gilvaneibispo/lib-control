<?php

namespace App\Http\Requests;

use App\Models\Subarea;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class LivroRequest extends FormRequest
{

    protected function prepareForValidation(): void
    {
        $normalizados = [];

        if ($this->has('isbn')) {
            $isbn = strtoupper((string) preg_replace('/[^0-9Xx]/', '', (string) $this->input('isbn')));
            $normalizados['isbn'] = $isbn === '' ? null : $isbn;
        }

        foreach (['cdd', 'cdu'] as $campo) {
            if ($this->has($campo)) {
                $normalizados[$campo] = $this->filled($campo) ? trim((string) $this->input($campo)) : null;
            }
        }

        $this->merge($normalizados);
    }

    public function rules(): array
    {
        $livro = $this->route('livro');
        $criando = $livro === null;
        $qtdMax = config('lib-control.exemplares.quantidade_max');

        return [
            'titulo' => ['required', 'string', 'max:255'],
            'subtitulo' => ['nullable', 'string', 'max:255'],
            'isbn' => [
                'nullable',
                'string',
                'regex:/^(\d{9}[\dX]|\d{13})$/',
                Rule::unique('livros', 'isbn')->ignore($livro),
            ],
            'ano' => ['nullable', 'integer', 'min:1450', 'max:' . (now()->year + 1)],
            'editora' => ['nullable', 'string', 'max:150'],
            'sinopse' => ['nullable', 'string', 'max:10000'],
            'cdd' => ['nullable', 'string', 'max:40'],
            'cdu' => ['nullable', 'string', 'max:80'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'subarea_id' => ['nullable', 'integer', 'exists:subareas,id'],
            'autores' => ['array', 'max:20'],
            'autores.*' => ['string', 'max:150'],
            'quantidade_exemplares' => [
                $criando ? 'sometimes' : 'prohibited',
                'integer',
                'min:1',
                'max:' . $qtdMax,
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $area = $this->input('area_id');
                $subarea = $this->input('subarea_id');
                if ($subarea) {
                    $pertence = Subarea::query()->whereKey($subarea)->where('area_id', $area)->exists();
                    if (!$pertence) {
                        $validator->errors()->add('subarea_id', 'A sub-área não pertence à área informada.');
                    }
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'isbn.unique' => 'Já existe um livro cadastrado com este ISBN.',
            'isbn.regex' => 'O ISBN deve ter 10 ou 13 dígitos.',
        ];
    }
}
