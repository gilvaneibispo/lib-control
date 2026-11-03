<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->restrictOnDelete();
            $table->foreignId('livro_id')->constrained('livros')->restrictOnDelete();
            $table->foreignId('exemplar_id')->constrained('exemplares')->restrictOnDelete();
            $table->string('status', 20)->default('ativa');
            $table->timestamp('expira_em');
            $table->timestamp('finalizada_em')->nullable();
            $table->timestamps();
            $table->index(['status', 'expira_em']);
            $table->index(['usuario_id', 'status']);
        });

        Schema::create('emprestimos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->restrictOnDelete();
            $table->foreignId('exemplar_id')->constrained('exemplares')->restrictOnDelete();
            $table->foreignId('reserva_id')->nullable()->constrained('reservas')->nullOnDelete();
            $table->string('origem', 20);
            $table->foreignId('emprestado_por')->constrained('usuarios');
            $table->timestamp('emprestado_em');
            $table->timestamp('devolver_ate');
            $table->timestamp('devolvido_em')->nullable();
            $table->foreignId('recebido_por')->nullable()->constrained('usuarios');
            $table->timestamps();
            $table->index(['usuario_id', 'devolvido_em']);
            $table->index(['devolvido_em', 'devolver_ate']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emprestimos');
        Schema::dropIfExists('reservas');
    }
};
