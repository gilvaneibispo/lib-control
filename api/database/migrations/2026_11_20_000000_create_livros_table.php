<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livros', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 255);
            $table->string('subtitulo', 255)->nullable();
            $table->string('isbn', 13)->nullable()->unique();
            $table->smallInteger('ano')->nullable();
            $table->string('editora', 150)->nullable();
            $table->text('sinopse')->nullable();
            $table->string('cdd', 40)->nullable()->index();
            $table->string('cdu', 80)->nullable()->index();
            $table->string('autores', 1000)->nullable(); // Separados por ';'
            $table->string('capa_url', 2048)->nullable(); // Link público
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livros');
    }
};
