<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ItemController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post("user-signup", [UserController::class, 'userSignUp']);

Route::post("user-login", [UserController::class, 'userLogin']);

Route::get("user/{email}", [UserController::class, 'userDetail']);

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