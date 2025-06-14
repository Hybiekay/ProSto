<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $project = Project::where("user_id", Auth::id())->orderBy("id", "desc")->with("documents")->paginate(10);
        return Inertia::render(
            'dashboard',
            [
                'projects' => $project
            ]
        );
    }
}
