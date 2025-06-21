<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProjectController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [UserController::class, "index"])->name('dashboard');
});


Route::get('/projects/invitations/{invitation}', [InvitationController::class, 'accept'])
    ->name('projects.accept-invitation')
    ->middleware('signed');
Route::middleware(['auth'])->group(callback: function () {
    Route::get('/users/search', [UserController::class, 'search'])->name('users.search');
    Route::post('/projects/{project}/invite', [InvitationController::class, 'sendInvitation'])->name('projects.invite');
    Route::get('/project', [ProjectController::class, 'form'])->name('project.form');
    Route::post('/project', [ProjectController::class, 'store'])->name('project.store');
    Route::delete('/projects/{id}', [ProjectController::class, 'delete'])->name('project.delete');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/document/{id}/edit', [DocumentController::class, 'edit'])->name('document.edit');
    Route::get('/document/{id}/view', [DocumentController::class, 'show'])->name('document.view');
    Route::post('/document/{id}/ai-edit', [DocumentController::class, 'editDocsWithAi'])
        ->name('document.ai-edit');
    Route::get('/document/{id}/download', [DocumentController::class, 'download'])->name('document.download');
    Route::get('/document/{id}', [DocumentController::class, 'index'])->name('projects.showDocs');
    Route::get('/shared-projects', [UserController::class, 'sharedWithMe'])
        ->name('projects.shared-with-me');

    // Update user permission
    Route::post('projects/{project}/users/{user}', [ProjectController::class, 'updatePermission'])
        ->name('projects.users.update');
    Route::delete('projects/{project}/users/{user}', [ProjectController::class, 'remove'])
        ->name('projects.users.remove');

    // Remove user from project
    Route::delete('/users/{user}', [ProjectController::class, 'remove'])
        ->name('projects.users.remove');
    // ...existing code...
    Route::put('/document/{id}', [DocumentController::class, 'update'])->name('document.update');
    // ...existing code...
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
