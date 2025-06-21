<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
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

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if the given user is the owner of the project.
     */

    public function isOwner()
    {
        $user = Auth::user();
        return $this->user_id === (is_object($user) ? $user->id : $user);
    }



    public function invitations()
    {
        return $this->hasMany(ProjectInvitation::class);
    }

    public function hasPendingInvite($userId)
    {
        return $this->invitations()
            ->where('invitee_id', $userId)
            ->where('status', 'pending')
            ->exists();
    }
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
    public function sharedUsers()
    {
        return $this->belongsToMany(User::class, 'project_user_shares', 'project_id', 'user_id')
            ->withPivot('permission')
            ->withTimestamps();
    }
    protected $casts = [
        'tech_stack' => 'array',
        'features' => 'array',
        'enhance_mode' => 'boolean',
    ];
}
