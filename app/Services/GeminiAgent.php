<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiAgent
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function callGeminiApi(string $apiKey, string $prompt): array
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
}
