<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Autor extends Model
{
    protected $table = 'autores';

    protected $fillable = ['nome'];

    public static function normalizarNome(string $nome): string
    {
        $espacosUnicos = (string) preg_replace('/\s+/u', ' ', $nome);

        return trim($espacosUnicos);
    }

    public function livros(): BelongsToMany
    {
        return $this->belongsToMany(Livro::class, 'autor_livro')->withPivot('ordem');
    }
}
