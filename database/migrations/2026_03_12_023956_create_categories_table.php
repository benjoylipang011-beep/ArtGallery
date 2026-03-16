<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        if (!Schema::hasColumn('artworks', 'category_id')) {
            Schema::table('artworks', function (Blueprint $table) {
                $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('artworks', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Category::class);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('categories');
    }
};      