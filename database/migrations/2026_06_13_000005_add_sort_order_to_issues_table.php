<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('number');
            $table->index(['status', 'sort_order']);
        });

        DB::table('issues')
            ->orderBy('number')
            ->get(['id', 'number'])
            ->each(function (object $issue): void {
                DB::table('issues')
                    ->where('id', $issue->id)
                    ->update(['sort_order' => ((int) $issue->number) * 1000]);
            });
    }

    public function down(): void
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->dropIndex(['status', 'sort_order']);
            $table->dropColumn('sort_order');
        });
    }
};
