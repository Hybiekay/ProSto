<?php

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



Route::middleware(['auth'])->group(function () {
    Route::get('/project', [ProjectController::class, 'form'])->name('project.form');
    Route::post('/project', [ProjectController::class, 'store'])->name('project.store');
    Route::delete('/projects/{id}', [ProjectController::class, 'delete'])->name('project.delete');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/project/docs/', [ProjectController::class, 'showDocs'])->name('projects.showDocs');
});


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
