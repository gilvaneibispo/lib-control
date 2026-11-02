<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('codigo')->unique();
            $table->string('nome', 100);
            $table->unsignedSmallInteger('ordem');
            $table->timestamps();
        });

        Schema::create('subareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('areas')->cascadeOnDelete();
            $table->string('nome', 100);
            $table->unsignedSmallInteger('ordem');
            $table->timestamps();
            $table->unique(['area_id', 'nome']);
        });

        Schema::table('livros', function (Blueprint $table) {
            $table->foreignId('area_id')->nullable()->after('cdu')->constrained('areas')->nullOnDelete();
            $table->foreignId('subarea_id')->nullable()->after('area_id')->constrained('subareas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('livros', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subarea_id');
            $table->dropConstrainedForeignId('area_id');
        });

        Schema::dropIfExists('subareas');
        Schema::dropIfExists('areas');
    }
};
