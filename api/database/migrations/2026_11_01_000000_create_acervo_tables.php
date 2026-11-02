<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Acervo: livros, autores (N:N com ordem) e exemplares físicos.
     */
    public function up(): void
    {
        Schema::create('livros', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 255);
            $table->string('subtitulo', 255)->nullable();
            $table->string('isbn', 20)->nullable()->unique();
            $table->smallInteger('ano')->nullable();
            $table->string('editora', 150)->nullable();
            $table->text('sinopse')->nullable();
            $table->string('cdd', 40)->nullable()->index();
            $table->string('cdu', 80)->nullable()->index();
            $table->string('capa_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('autores', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150)->unique();
            $table->timestamps();
        });

        Schema::create('autor_livro', function (Blueprint $table) {
            $table->foreignId('livro_id')->constrained('livros')->cascadeOnDelete();
            $table->foreignId('autor_id')->constrained('autores')->cascadeOnDelete();
            $table->unsignedSmallInteger('ordem')->default(0);
            $table->primary(['livro_id', 'autor_id']);
        });

        Schema::create('exemplares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livro_id')->constrained('livros')->cascadeOnDelete();
            $table->string('codigo', 30)->unique();
            $table->string('status', 20)->default('disponivel')->index();
            $table->string('observacao', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exemplares');
        Schema::dropIfExists('autor_livro');
        Schema::dropIfExists('autores');
        Schema::dropIfExists('livros');
    }
};
