<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Document extends Model
{

    // app/Models/Document.php

    protected $fillable = [
        'id',
        'project_id',
        'title',
        'type',
        'status',
        'last_updated',
        "content",
        "formats",
        'word_count',
        "doc_url"
    ];
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    protected $casts = [
        'last_updated' => 'datetime',
    ];
}
