<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{


    // app/Models/Project.php

    protected $fillable = [
        'id',
        'user_id',
        'name',
        'description',
        'tech_stack',
        'features',
        'project_idea',
        'target_audience',
        'enhanced_mode',
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

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function sharedUsers()
    {
        return $this->belongsToMany(User::class, 'project_user_shares')->withTimestamps();
    }

    protected $casts = [
        'tech_stack' => 'array',
        'features' => 'array',
        'enhance_mode' => 'boolean',
    ];
}
