<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ItemResource;
use App\Models\Category;
use App\Services\PasswordHealth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request, PasswordHealth $health): JsonResponse
    {
        $user = $request->user();

        $countsByCategory = $user->items()->selectRaw('category_id, count(*) as total')
            ->groupBy('category_id')->pluck('total', 'category_id');

        $categories = Category::where('status', 1)->orderBy('id')->get(['id', 'name'])->map(fn ($category) => [
            'id' => $category->id,
            'name' => $category->name,
            'count' => (int) ($countsByCategory[$category->id] ?? 0),
        ]);

        $recent = $user->items()->with(['folder:id,name', 'category:id,name'])
            ->latest('updated_at')->orderByDesc('id')->limit(5)->get();

        return response()->json(['data' => [
            'items' => $user->items()->count(),
            'folders' => $user->folders()->count(),
            'categories' => $categories,
            'health' => $health->report($user),
            'recent' => ItemResource::collection($recent)->resolve($request),
        ]]);
    }
}
