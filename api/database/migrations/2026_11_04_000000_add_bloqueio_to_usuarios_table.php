<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->timestamp('bloqueado_em')->nullable()->after('complemento');
            $table->string('motivo_bloqueio')->nullable()->after('bloqueado_em');
            $table->boolean('bloqueio_automatico')->default(false)->after('motivo_bloqueio');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn(['bloqueado_em', 'motivo_bloqueio', 'bloqueio_automatico']);
        });
    }
};
