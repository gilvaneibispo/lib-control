<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StatusExemplar;
use Illuminate\Database\Eloquent\Model;

class Exemplar extends Model
{
    protected $table = 'exemplares';

    protected $fillable = ['livro_id', 'codigo', 'status', 'observacao'];

    protected $attributes = ['status' => 'disponivel'];

    protected function casts(): array
    {
        return ['status' => StatusExemplar::class];
    }
}
