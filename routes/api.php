<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\VaultTransferController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard', DashboardController::class);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::apiResource('folders', FolderController::class)->except('show')->where(['folder' => '[0-9]+']);
    Route::apiResource('items', ItemController::class)->where(['item' => '[0-9]+']);
    Route::get('vault/export', [VaultTransferController::class, 'export']);
    Route::post('vault/import', [VaultTransferController::class, 'import']);
});
