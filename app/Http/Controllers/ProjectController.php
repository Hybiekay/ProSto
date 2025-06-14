<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use App\Services\GeminiKeyManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;


class ProjectController extends Controller
{

    private $keyManager = null;

    public function __construct()
    {
        $this->keyManager = new GeminiKeyManager();
    }

    public function form()
    {
        return Inertia::render('projects/form', []);
    }

    public function show(Project $project)
    {
        $project->load('documents'); // eager load related docs

        return Inertia::render('projects/show', [
            'project' => $project,
        ]);
    }



    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'idea' => 'nullable|string',
            'docType' => 'required|string',
            'features' => 'nullable|string',
        ]);

        $project = Project::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'],
            'project_idea' => $validated['idea'],
            "features" => $validated["features"],
            "enhanced_mode" => $validated["docType"] === "enhance",
        ]);



        // Call AI here (you'll use a service class or helper)
        $aiResponse = $this->generateInitialDocs($project);

        // Save in database
        Document::create([
            'project_id' => $project->id,
            'type'       => "overview",
            'title'      => "Project Overview",
            'content'    => $aiResponse['generatedText'], // raw text
            'doc_url'    => $aiResponse['docxUrl'],       // public file URL
            'document_path' => $aiResponse['docxFilename'],

        ]);
        // Save documents


        return redirect()->route('projects.show', $project);
    }

    protected function generateInitialDocs(Project $project): array
    {
        try {
            $apiKey = $this->keyManager->getNextKey();
            $timestamp = now()->format('YmdHis');

            // Prepare the AI prompt based on enhancement mode
            $prompt = $this->buildPrompt($project);

            // Generate content from Gemini API
            $response = $this->callGeminiApi($apiKey, $prompt);
            $generatedText = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            if (empty($generatedText)) {
                throw new \Exception('No content generated from AI');
            }

            // Save raw outputs
            $outputs = [
                'raw_markdown' => $generatedText,
                'raw_html' => $this->markdownToHtml($generatedText),
                'formats' => []
            ];

            // Generate and save DOCX
            $docxOutput = $this->generateDocx($generatedText, $timestamp);
            if ($docxOutput) {
                $outputs['formats']['docx'] = $docxOutput;
            }

            // Generate and save HTML file
            $htmlOutput = $this->generateHtmlFile($outputs['raw_html'], $timestamp);
            if ($htmlOutput) {
                $outputs['formats']['html'] = $htmlOutput;
            }

            // Save raw data for debugging
            $this->storeDebugData($project, $prompt, $response, $outputs, $timestamp);

            return $outputs;
        } catch (\Exception $e) {
            Log::error("Document generation failed: " . $e->getMessage());
            throw $e;
        }
    }

    protected function buildPrompt(Project $project): string
    {
        $baseTemplate = $project->enhanced_mode ?
            "Enhance and polish the following project idea. Generate professional documentation including:\n" :
            "Generate complete project documentation including:\n";

        return $baseTemplate . "
- Project Overview
- Tech Stack Description
- Feature Explanation
- About Screen content
- Platform recommendation (web/mobile)
- Installation/Setup instructions if applicable

Project Details:
Name: {$project->name}
Idea: {$project->project_idea}
" . ($project->tech_stack ? "Tech Stack: {$project->tech_stack}\n" : "") . "
Key Features: {$project->features}
" . ($project->target_audience ? "Target Audience: {$project->target_audience}\n" : "") . "

Format the response in Markdown with appropriate headings (## for sections).";
    }

    protected function callGeminiApi(string $apiKey, string $prompt): array
    {
        return Http::withOptions([
            'verify' => false,
            'timeout' => 60,
        ])->withHeaders([
            "Content-Type" => "application/json",
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'topP' => 0.9,
                'maxOutputTokens' => 2048
            ]
        ])->throw()->json();
    }

    protected function markdownToHtml(string $markdown): string
    {
        // Using commonmark for better Markdown parsing
        $converter = new \League\CommonMark\CommonMarkConverter();
        return $converter->convert($markdown)->getContent();
    }

    protected function generateDocx(string $content, string $timestamp): ?array
    {
        try {
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();

            // Parse markdown and add formatted content
            $this->addMarkdownToWord($section, $content);

            $tempPath = storage_path("app/temp_{$timestamp}.docx");
            $writer = IOFactory::createWriter($phpWord, 'Word2007');
            $writer->save($tempPath);

            $docxFilename = "docs/project_doc_{$timestamp}.docx";
            Storage::disk('public')->put($docxFilename, file_get_contents($tempPath));
            unlink($tempPath);

            return [
                'filename' => $docxFilename,
                'url' => Storage::url($docxFilename),
                'size' => Storage::disk('public')->size($docxFilename)
            ];
        } catch (\Exception $e) {
            Log::error("DOCX generation failed: " . $e->getMessage());
            return null;
        }
    }

    protected function generateHtmlFile(string $html, string $timestamp): ?array
    {
        try {
            $htmlFilename = "docs/project_doc_{$timestamp}.html";
            $fullHtml = "<!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Project Documentation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1, h2, h3 { color: #2c3e50; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
                code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
        $html
        </body>
        </html>";

            Storage::disk('public')->put($htmlFilename, $fullHtml);

            return [
                'filename' => $htmlFilename,
                'url' => Storage::url($htmlFilename),
                'size' => Storage::disk('public')->size($htmlFilename)
            ];
        } catch (\Exception $e) {
            Log::error("HTML generation failed: " . $e->getMessage());
            return null;
        }
    }

    protected function addMarkdownToWord(&$section, $markdown)
    {
        // Simple markdown to Word conversion
        $lines = explode("\n", $markdown);
        foreach ($lines as $line) {
            if (preg_match('/^#\s(.+)/', $line, $matches)) {
                $section->addTitle($matches[1], 1);
            } elseif (preg_match('/^##\s(.+)/', $line, $matches)) {
                $section->addTitle($matches[1], 2);
            } elseif (preg_match('/^###\s(.+)/', $line, $matches)) {
                $section->addTitle($matches[1], 3);
            } elseif (preg_match('/^\*\s(.+)/', $line, $matches)) {
                $section->addListItem($matches[1], 0);
            } else {
                $section->addText($line);
            }
        }
    }

    protected function storeDebugData($project, $prompt, $response, $outputs, $timestamp)
    {
        Storage::put("logs/generation_{$timestamp}.json", json_encode([
            'project_id' => $project->id,
            'prompt' => $prompt,
            'response' => $response,
            'outputs' => $outputs,
            'timestamp' => now()->toDateTimeString()
        ], JSON_PRETTY_PRINT));
    }


    //     protected function generateInitialDocs(Project $project): array
    //     {
    //         $apiKey = $this->keyManager->getNextKey();
    //         $isEnhanced = $project->enhanced_mode;

    //         $prompt = $isEnhanced ? "
    // Enhance and polish the following project idea. Generate professional documentation based on the details below.

    // Project Name: {$project->name}
    // Project Idea: {$project->project_idea}
    // Tech Stack: {$project->tech_stack}
    // Key Features: {$project->features}
    // Target Audience: {$project->target_audience}

    // The documentation should include:
    // - Enhanced Project Overview
    // - Tech Stack Description
    // - Feature Explanation
    // - About Screen (suggest content)
    // - Recommend whether this is best as a web or mobile app
    // " : "
    // Generate a complete project documentation based on the following information:

    // Project Name: {$project->name}
    // Project Idea: {$project->project_idea}
    // Tech Stack: {$project->tech_stack}
    // Key Features: {$project->features}
    // Target Audience: {$project->target_audience}

    // The documentation should include:
    // - Project Overview
    // - Tech Stack Description
    // - Feature Explanation
    // - About Screen (suggest what should be on it)
    // - Whether it's best suited as a web or mobile project and why
    // ";

    //         $response = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders(["Content-Type" => "application/json",])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey", [
    //             'contents' => [
    //                 [
    //                     'parts' => [
    //                         ['text' => $prompt]
    //                     ]
    //                 ]
    //             ]
    //         ]);

    //         $data = $response->json();
    //         Storage::put("logs/content" . now()->format('YmdHis') . '.json', json_encode($data, JSON_PRETTY_PRINT));

    //         $generatedText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    //         $timestamp = now()->format('YmdHis');

    //         $value = [
    //             'raw_markdown' => $generatedText,
    //         ];
    //         Storage::put("logs/value{$timestamp}.json", json_encode($value, JSON_PRETTY_PRINT));

    //         // ✅ Generate and save DOCX
    //         if (!empty($generatedText)) {
    //             $phpWord = new PhpWord();
    //             $section = $phpWord->addSection();
    //             $section->addText($generatedText);

    //             // Save temp file
    //             $tempPath = storage_path("app/temp_{$timestamp}.docx");
    //             $writer = IOFactory::createWriter($phpWord, 'Word2007');
    //             $writer->save($tempPath);

    //             // Read and store with Laravel's public disk
    //             $docxContent = file_get_contents($tempPath);
    //             $docxFilename = "docs/project_doc_{$timestamp}.docx";

    //             // Save to 'public' disk
    //             Storage::disk('public')->put($docxFilename, $docxContent);

    //             // Remove temp file
    //             unlink($tempPath);

    //             // Get public URL
    //             $docxUrl = Storage::url($docxFilename);
    //         }

    //         return [
    //             'generatedText' => $generatedText,
    //             'docxFilename' => $docxFilename ?? null,
    //             'docxUrl' => $docxUrl ?? null,  // this key must match your usage
    //         ];
    //     }



    public function delete($id)
    {
        $project = Project::findOrFail($id);
        // Delete related documents
        foreach ($project->documents as $document) {
            // Delete docx file if exists
            if ($document->document_path && Storage::disk('public')->exists($document->document_path)) {
                Storage::disk('public')->delete($document->document_path);
            }
            $document->delete();
        }

        // Delete the project itself
        $project->delete();

        return redirect()->route('dashboard')->with('success', 'Project deleted successfully.');
    }


    public function showDocs()
    {
        return Inertia::render('projects/docs/docs-edit');
    }
}
