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
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('type', [
                'technical',
                'ui-ux',
                'product',
                'collaboration',
                'client',
                'testing',
                'security',
                'operations',
                "overview",
                "roadmap"
            ]);
            $table->enum('status', ['draft', 'generating', 'published', 'archived'])->default('draft');
            $table->longText('content')->nullable();
            $table->longText('content_raw')->nullable();
            $table->longText('content_html')->nullable();
            $table->longText('content_json')->nullable();
            $table->json('formats')->nullable();
            $table->integer('word_count')->nullable();
            $table->integer('progress')->nullable(); // % for generating status
            $table->string('doc_url')->nullable(); // % for generating status
            $table->string('document_path')->nullable(); // % for generating status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
