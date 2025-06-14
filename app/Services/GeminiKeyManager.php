<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class GeminiKeyManager
{
    /**
     * Create a new class instance.
     */


    protected $keys;
    protected $cacheKey = 'gemini_current_key_index';

    public function __construct()
    {
        $this->keys = config('gemini.keys');
    }

    public function getNextKey()
    {
        $index = Cache::get($this->cacheKey, 0);
        $key = $this->keys[$index];

        // Update index for next use
        $nextIndex = ($index + 1) % count($this->keys);
        Cache::put($this->cacheKey, $nextIndex, now()->addHours(24));

        return $key;
    }
}
