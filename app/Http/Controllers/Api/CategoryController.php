<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('status', 1)->orderBy('id')->limit(100)->get(['id', 'name']);

        return response()->json(['data' => $categories]);
    }
}
