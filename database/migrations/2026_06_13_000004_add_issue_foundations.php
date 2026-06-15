<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color', 24);
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('planned');
            $table->string('lead')->nullable();
            $table->date('start_date')->nullable();
            $table->date('target_date')->nullable();
            $table->string('icon', 32)->default('box');
            $table->string('color', 24)->default('#5E6AD2');
            $table->timestamps();
        });

        Schema::create('cycles', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('number');
            $table->date('starts_at');
            $table->date('ends_at');
            $table->string('team')->default('DEV');
            $table->timestamps();

            $table->unique(['team', 'number']);
        });

        Schema::table('issues', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('assignee')->constrained()->nullOnDelete();
            $table->foreignId('cycle_id')->nullable()->after('project_id')->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->after('cycle_id')->constrained('issues')->nullOnDelete();
            $table->date('due_date')->nullable()->after('parent_id');
            $table->unsignedTinyInteger('estimate')->nullable()->after('due_date');
            $table->timestamp('started_at')->nullable()->after('estimate');
            $table->timestamp('completed_at')->nullable()->after('started_at');
        });

        Schema::create('issue_label', function (Blueprint $table) {
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('label_id')->constrained()->cascadeOnDelete();
            $table->primary(['issue_id', 'label_id']);
        });

        Schema::create('issue_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_issue_id')->constrained('issues')->cascadeOnDelete();
            $table->string('type');
            $table->timestamps();

            $table->unique(['issue_id', 'related_issue_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_relations');
        Schema::dropIfExists('issue_label');

        Schema::table('issues', function (Blueprint $table) {
            $table->dropConstrainedForeignId('project_id');
            $table->dropConstrainedForeignId('cycle_id');
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn(['due_date', 'estimate', 'started_at', 'completed_at']);
        });

        Schema::dropIfExists('cycles');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('labels');
    }
};
