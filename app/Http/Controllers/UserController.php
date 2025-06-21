<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $project = Project::where("user_id", Auth::id())->orderBy("id", "desc")->with(["documents", "owner",])->paginate(10);
        return Inertia::render(
            'dashboard',
            [
                'projects' => $project
            ]
        );
    }

    public function sharedWithMe()
    {
        $user = Auth::user();

        // Get all projects shared with the authenticated user
        $sharedProjects = $user->sharedProjects()->with('owner', "documents")->get();

        return Inertia::render('projects/shared-with-me', [
            'projects' => $sharedProjects

        ]);
    }

    public function search(Request $request)
    {
        try {
            $request->validate([
                'q' => 'required|string|max:255',
                'project_id' => 'required|exists:projects,id',
            ]);

            $query = $request->input('q');
            $projectId = $request->input('project_id');

            $users = User::query()
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%$query%")
                        ->orWhere('email', 'like', "%$query%");
                })
                ->where('id', '!=', Auth::id())
                ->whereDoesntHave('sharedProjects', function ($subQuery) use ($projectId) {
                    $subQuery->where('project_id', $projectId);
                })
                ->select('id', 'name', 'email', 'avatar')
                ->limit(10)
                ->get();

            return response()->json($users);
        } catch (\Exception $e) {
            \Log::error('Search error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 400);
        }
    }
}
