<?php

namespace App\Mail;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class ProjectInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public ProjectInvitation $invitation;
    public $project;
    public $inviter;
    public $invitee;
    public string $acceptUrl;

    public function __construct(ProjectInvitation $invitation)
    {
        $this->invitation = $invitation;
        $this->project = $invitation->project;
        $this->inviter = $invitation->inviter;
        $this->invitee = $invitation->invitee;
        $this->acceptUrl = URL::temporarySignedRoute(
            'projects.accept-invitation', // Your route name
            now()->addDays(2),            // Expiration time
            ['invitation' => $invitation->id]
        );
    }

    /**
     * Get the message envelope.
     */


    public function content(): Content
    {
        return new Content(
            view: 'emails.project.invitation',
            with: [
                'invitation' => $this->invitation,
                'project' => $this->project,
                'inviter' => $this->inviter,
                'invitee' => $this->invitee,
                'acceptUrl' => $this->acceptUrl,
            ]
        );
    }
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're invited to collaborate on {$this->project->name}",
        );
    }
    /**
     * Get the message content definition.
     */


    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
