<?php

namespace App\Http\Controllers;

use App\Mail\ProjectInvitationMail;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class InvitationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }


    public function sendInvitation(Request $request, Project $project)
    {
        $validated = $request->validate([
            'invitee_id' => ['required', 'exists:users,id'], // Custom rule
            'permission' => 'required|in:view,edit',
        ]);

        // Authorization check (using policies recommended)
        if ($project->user_id !== Auth::id()) {
            abort(403, 'Only project owner can invite users');
        }

        // Check for existing invites (scoped to model)
        if ($project->hasPendingInvite($validated['invitee_id'])) {

            return back()->with('error', 'User already has pending invite');
        }

        $invitation = $project->invitations()->create([
            'inviter_id' => Auth::id(),
            'invitee_id' => $validated['invitee_id'],
            'permission' => $validated['permission'],
        ]);

        // Optional: Queue notification

        $invitee = User::findOrFail($validated['invitee_id']); // ✅ add this line

        Mail::to($invitee->email)->send(new ProjectInvitationMail($invitation));


        return back()->with('success', 'Invitation sent successfully');
    }

    /**
     * Display the specified resource.
     */


    public function accept(ProjectInvitation $invitation)
    {
        if (!request()->hasValidSignature()) {
            abort(403, 'Invalid or expired invitation link');
        }

        // Add user to project
        $invitation->project->sharedUsers()->attach($invitation->invitee_id, [
            'permission' => $invitation->permission
        ]);

        // Mark invitation as accepted
        $invitation->update(['status' => 'accepted']);

        return redirect()->route('projects.show', $invitation->project)
            ->with('success', 'You have successfully joined the project!');
    }
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
