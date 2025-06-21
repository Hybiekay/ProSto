<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use App\Services\AiDocsGeneratorPrompt;
use App\Services\GeminiAgent;
use App\Services\GeminiKeyManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;


class ProjectController extends Controller
{

    private $keyManager = null;
    private $prompt = null;
    private $agent = null;


    public function __construct()
    {
        $this->keyManager = new GeminiKeyManager();
        $this->prompt = new AiDocsGeneratorPrompt();
        $this->agent = new GeminiAgent();
    }

    public function form()
    {
        return Inertia::render('projects/form', []);
    }

    public function show(Project $project)
    {
        $project->load(['documents', 'sharedUsers']); // eager load related docs

        $isOwner = Auth::check() && Auth::id() === $project->user_id;

        $isRelated = false;
        $about = null;

        if (!$isOwner && Auth::check()) {
            // Check if user is in sharedUsers

            // dd($project->sharedUsers);
            $user = Auth::user();
            $sharedUser = $project->sharedUsers->firstWhere('id', $user->id);
            // dd($sharedUser);
            if ($sharedUser) {
                $isRelated = true;
                $about = $sharedUser->pivot->permission ?? null;
            }
        }

        return Inertia::render('projects/show', [
            'project' => $project->toArray(),
            'isOwner' => $isOwner,
            'isRelated' => $isRelated,
            'permission' => $about,
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





        $aiResponse = $this->generateInitialDocs($project);

        if ($aiResponse) {

            // Save all formats to database
            Document::create([
                'project_id'     => $project->id,
                'type'           => "overview",
                'title'          => "Project Overview",
                'content'    => $aiResponse['raw_html'],  // Original Markdown
                'formats'   => json_encode($aiResponse),     // Full JSON response

            ]);

            // Save documents

            // OPTIONAL: Extract new features from AI (if needed)
            $newFeatures = $this->extractFeaturesFromAI($aiResponse['raw_html']); // implement this
            if (!empty($newFeatures)) {
                $project->update([
                    'features' => $newFeatures,
                ]);
            }
        }

        return redirect()->route('projects.show', $project);
    }

    protected function generateInitialDocs(Project $project): array
    {
        try {
            $apiKey = $this->keyManager->getNextKey();
            // Prepare the AI prompt based on enhancement mode
            $prompt = $this->prompt->overview($project);
            // Generate content from Gemini API
            $response = $this->agent->callGeminiApi($apiKey, $prompt);
            $generatedText = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

            if (empty($generatedText)) {
                throw new \Exception('No content generated from AI');
            }
            // Clean the generated HTML
            $cleanHtml = $this->cleanGeneratedHtml($generatedText);

            $outputs = [
                'raw_html' => $cleanHtml,
                'formats' => []
            ];
            return $outputs;
        } catch (\Exception $e) {
            Log::error("Document generation failed: " . $e->getMessage());
            throw $e;
        }
    }
    protected function extractFeaturesFromAI(string $aiContent): string
    {
        // Basic regex to capture content under a "Features" heading (can be adjusted)
        preg_match('/Features\s*:?(.+?)(?=(\n[A-Z][a-z]+|$))/is', $aiContent, $matches);

        if (!empty($matches[1])) {
            $rawFeatures = trim($matches[1]);
            return strip_tags($rawFeatures); // remove HTML tags and return clean text
        }

        return '';
    }


    protected function cleanGeneratedHtml(string $generatedText): string
    {
        // Remove Markdown code blocks (```html and ```)
        $cleanText = preg_replace('/```html|```/', '', $generatedText);

        return trim($cleanText);
    }


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


    // Update user's permission
    public function updatePermission(Request $request, Project $project, User $user)
    {
        if (!$project->sharedUsers()->where('users.id', $user->id)->exists()) {
            abort(404, 'User not found in this project');
        }

        $validated = $request->validate([
            'permission' => ['required', Rule::in(['view', 'edit'])],
        ]);
        // 
        $project->sharedUsers()->updateExistingPivot($user->id, [
            'permission' => $validated['permission'],
        ]);

        return back()->with('success', 'User removed from project');
    }

    public function remove(Request $request, Project $project, User $user)
    {
        if (!$project->sharedUsers()->where('users.id', $user->id)->exists()) {
            abort(404, 'User not found in this project');
        }


        // Detach user
        $project->sharedUsers()->detach($user->id);


        return back()->with('success', 'User removed from project');
    }
}
