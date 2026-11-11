<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ItemController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::post("add-folder", [FolderController::class, 'create']);
Route::get("fetch-folder/{id}", [FolderController::class, 'index']);
Route::get("fetch-single-folder/{id}", [ItemController::class, 'itemsByFolderId']);
Route::delete("delete-folder/{id}", [FolderController::class, 'delete']);
Route::post("edit-folder", [FolderController::class, 'edit']);
Route::post("add-vault", [ItemController::class, 'create']);
Route::get("fetch-vault/{id}", [ItemController::class, 'index']);
Route::get("fetch-single-vault/{id}/{userId}", [ItemController::class, 'show']);
Route::delete("delete-vault/{id}", [ItemController::class, 'delete']);
Route::post("edit-vault", [ItemController::class, 'edit']);
Route::get("export-vault/{id}", [ItemController::class, 'export']);
Route::post("import-vault", [ItemController::class, 'import']);
