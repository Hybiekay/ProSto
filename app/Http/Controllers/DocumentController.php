<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use App\Services\AiDocsGeneratorPrompt;
use App\Services\GeminiAgent;
use App\Services\GeminiKeyManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use Whoops\Inspector\InspectorFactoryInterface;

class DocumentController extends Controller
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


    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        return Inertia::render('projects/docs/docs-edit');
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    public function edit($id)
    {
        $document = Document::findOrFail($id);
        return Inertia::render('projects/docs/docs-edit', [
            'document' => $document
        ]);
    }

    /**
     * Display the specified resource.
     */

    public function editDocsWithAi(Request $request, $id)
    {
        $request->validate([
            'prompt' => 'required|string|min:5',
        ]);

        $apikey = $this->keyManager->getNextKey();
        $document = Document::findOrFail($id);
        $inputP = $request->get('prompt');

        $generativePrompt = $this->prompt->overviewDocsAiEdit($document, $inputP);

        $response = $this->agent->callGeminiApi($apikey, $generativePrompt);
        $generatedText = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($generatedText)) {
            return response()->json([
                'message' => 'AI failed to generate content. Try again.',
                'content' => $document->fresh(),
            ]);
        }

        $cleanHtml = $this->cleanGeneratedHtml($generatedText);

        if (!empty($cleanHtml)) {
            $updatedContent =     $document->update(['content' => $cleanHtml]);
        }


        // return redirect()->back()->with('success', 'Document updated successfully.');
        return response()->json([
            'message' => 'AI edit applied',
            'content' => $document->fresh(),
        ]);
    }




    protected function cleanGeneratedHtml(string $generatedText): string
    {
        // Remove Markdown code blocks (```html and ```)
        $cleanText = preg_replace('/```html|```/', '', $generatedText);

        return trim($cleanText);
    }

    public function show($id)
    {
        $document = Document::findOrFail($id);

        return Inertia::render('projects/docs/document-view', [
            'document' => $document, // Stored HTML
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
        ]);

        $document = Document::findOrFail($id);
        $project = Project::findOrFail($document->project_id);

        $isOwner = $project->user_id === Auth::id();
        $shared = $project->sharedUsers()->where('user_id', Auth::id())->first();
        $canEdit = $isOwner || ($shared && $shared->pivot->permission === 'edit');

        if (!$canEdit) {
            abort(403, 'You do not have permission to edit this project.');
        }

        $document->update($request->only(['title', 'content']));

        return redirect()->back()->with('success', 'Document updated successfully.');
    }


    public function download(Request $request, string $id)
    {
        $document = Document::findOrFail($id);
        $project = Project::findOrFail($document->project_id);

        $isOwner = $project->user_id === Auth::id();
        $shared = $project->sharedUsers()->where('user_id', Auth::id())->first();
        $canEdit = $isOwner || ($shared && $shared->pivot->permission === 'edit');

        if (!$canEdit) {
            abort(403, 'You do not have permission to edit this project.');
        }

        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $html = $document->content;

        \PhpOffice\PhpWord\Shared\Html::addHtml($section, $html, false, false);

        $tempFile = tempnam(sys_get_temp_dir(), 'word');
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        return response()->download($tempFile, 'document.docx')->deleteFileAfterSend(true);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
