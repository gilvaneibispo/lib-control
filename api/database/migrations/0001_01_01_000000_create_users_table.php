<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('papel', 10)->default('leitor')->index();
            $table->string('nome', 150);
            $table->string('email')->unique();
            $table->string('password');
            $table->char('cpf', 11)->unique();
            $table->date('data_nascimento');
            $table->string('foto_path')->nullable();

            // Endereço
            $table->char('cep', 8);
            $table->char('uf', 2);
            $table->string('cidade', 100);
            $table->string('bairro', 100);
            $table->string('rua', 150);
            $table->string('numero', 10);
            $table->string('complemento', 100)->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
