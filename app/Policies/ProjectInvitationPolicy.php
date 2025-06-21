<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectInvitationPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }



    public function invite(User $user, Project $project)
    {
        return $user->id === $project->user_id;
    }

    public function updatePermission(User $user, Project $project)
    {
        return $user->id === $project->user_id;
    }

    public function remove(User $user, Project $project)
    {
        return $user->id === $project->user_id;
    }
}
