<?php

namespace App\Notifications;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $invitation;
    public $project;
    public $inviter;

    public function __construct(ProjectInvitation $projectInvitation)
    {
        $this->invitation = $projectInvitation;
        $this->project = $projectInvitation->project;
        $this->inviter = $projectInvitation->inviter;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $acceptUrl = route('projects.accept-invitation', $this->invitation);

        return (new MailMessage)
            ->subject("You've been invited to {$this->project->name}")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->inviter->name} has invited you to collaborate on the project:")
            ->action('Accept Invitation', $acceptUrl) // ⚠️ Will be ignored if view() is used
            ->view('emails.project.invitation', [ // 🚀 This will override everything
                'invitation' => $this->invitation,
                'project' => $this->project,
                'inviter' => $this->inviter,
                'notifiable' => $notifiable,
            ]);
    }

    public function toArray($notifiable)
    {
        return [
            'project_id' => $this->project->id,
            'project_name' => $this->project->name,
            'inviter_name' => $this->inviter->name,
            'permission' => $this->invitation->permission,
        ];
    }
}
