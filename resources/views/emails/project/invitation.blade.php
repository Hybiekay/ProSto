<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Project Invitation</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #4a5568;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .logo {
            max-height: 60px;
        }

        .content {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-top: 20px;
        }

        h1 {
            color: #2d3748;
            font-size: 24px;
            margin-top: 0;
        }

        .project-card {
            background-color: #f7fafc;
            border-left: 4px solid #4299e1;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        h2 {
            color: #2d3748;
            font-size: 20px;
            margin: 0 0 10px 0;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4299e1;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            padding: 20px 0;
            color: #718096;
            font-size: 14px;
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header with Logo -->
        <div class="header">
            <a href="{{ config('app.url') }}">
                <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }}" class="logo">
            </a>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h1>You've Been Invited to a Project!</h1>

            <p>
                <strong>{{ $inviter->name }}</strong> has invited you to collaborate on the project:
            </p>

            <div class="project-card">
                <h2>{{ $project->name }}</h2>
                <p>{{ $project->description ?? 'No description provided' }}</p>
            </div>

            <p>
                You've been granted <strong>{{ $invitation->permission === 'edit' ? 'Edit' : 'View' }}</strong> access
                to this project.
            </p>

            <!-- Action Button -->
            <a href="{{ $acceptUrl}}" class="button">
                Accept Invitation
            </a>

            <p style="color: #718096; margin-top: 30px;">
                If you didn't expect to receive this invitation, you can ignore this email or contact the project owner.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>

</html>