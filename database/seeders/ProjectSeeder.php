<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        // $user = User::where('email', 'hybiekay2@gmail.com')->first();

        // if (!$user) {
        //     $user = User::create([
        //         'id' => Str::uuid(),
        //         'name' => 'Hybie Kay',
        //         'email' => 'hybiekay2@gmail.com',
        //         'password' => Hash::make('password123'),
        //     ]);
        //     dd($user->id);
        // }

        $user = User::firstOrCreate(
            ['email' => 'hybiekay2@gmail.com'],
            [
                // 'id' => (string) Str::uuid(), // UUID as string
                'name' => 'Hybie Kay',
                'password' => Hash::make('password123'),
            ]
        );


        $project = Project::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'name' => 'E-Commerce Platform',
            'description' => 'Online store with payment integration and inventory management',
            'tech_stack' => ['React', 'Node.js', 'MongoDB', 'Stripe', 'Tailwind CSS'],
            'features' => [],
            'project_idea' => 'A modern platform for team task management and communication in real time',

            'enhanced_mode' => false,
        ]);

        Document::insert([
            [
                'id' => Str::uuid(),
                'project_id' => $project->id,
                'title' => 'API Documentation',
                'type' => 'technical',
                'status' => 'published',
                'word_count' => 1245
            ],
            [
                'id' => Str::uuid(),
                'project_id' => $project->id,
                'title' => 'User Flow Diagrams',
                'type' => 'ui-ux',
                'status' => 'published',
                'word_count' => 842
            ],
            [
                'id' => Str::uuid(),
                'project_id' => $project->id,
                'title' => 'Product Roadmap',
                'type' => 'product',
                'status' => 'draft',

                'word_count' => 356
            ]
        ]);






        $project2 = Project::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'name' => 'Task Management App',
            'description' => 'Team collaboration tool with real-time updates',
            'tech_stack' => ['Next.js', 'TypeScript', 'PostgreSQL', 'WebSockets'],
            'features' => [],
            'enhanced_mode' => true,
            'project_idea' => 'A modern platform for team task management and communication in real time',
            'target_audience' => 'Teams and remote workers',
        ]);

        Document::insert([
            [
                'id' => (string) Str::uuid(),
                'project_id' => $project2->id,
                'title' => 'Database Schema',
                'type' => 'technical',
                'status' => 'published',
                'word_count' => 932,
            ],
            [
                'id' => (string) Str::uuid(),
                'project_id' => $project2->id,
                'title' => 'Onboarding Guide',
                'type' => 'collaboration',
                'status' => 'published',
                'word_count' => 567,
            ],
        ]);
    }
}
