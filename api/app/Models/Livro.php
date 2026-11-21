<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Livro extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'titulo',
        'subtitulo',
        'isbn',
        'ano',
        'editora',
        'sinopse',
        'cdd',
        'cdu',
        'autores',
        'capa_url',
    ];

    protected function casts()
    {
        return [
            'ano' => 'integer',
        ];
    }

    /** Devolve os campos do livro formatado **/
    public function formatar()
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'subtitulo' => $this->subtitulo,
            'isbn' => $this->isbn,
            'ano' => $this->ano,
            'editora' => $this->editora,
            'sinopse' => $this->sinopse,
            'cdd' => $this->cdd,
            'cdu' => $this->cdu,
            'autores' => $this->autores,
            'capa_url' => $this->capa_url,
            'criado_em' => $this->created_at?->toIso8601String(),
        ];
    }
}
