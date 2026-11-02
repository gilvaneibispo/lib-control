<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exemplares', function (Blueprint $table) {
            $table->string('codigo', 40)->change();
            $table->dropIndex(['status']);
            $table->index(['livro_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('exemplares', function (Blueprint $table) {
            $table->dropIndex(['livro_id', 'status']);
            $table->index('status');
            $table->string('codigo', 30)->change();
        });
    }
};
