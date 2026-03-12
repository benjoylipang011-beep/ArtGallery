<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // status already exists as: pending | processing | shipped | delivered | cancelled
            // We just need to ensure the allowed values are documented.
            // Add a tracking note field and confirmed/shipped/delivered timestamps
            $table->text('tracking_note')->nullable()->after('status');
            $table->timestamp('confirmed_at')->nullable()->after('tracking_note');
            $table->timestamp('shipped_at')->nullable()->after('confirmed_at');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->timestamp('cancelled_at')->nullable()->after('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tracking_note', 'confirmed_at', 'shipped_at', 'delivered_at', 'cancelled_at']);
        });
    }
};