<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Http\Resources\ItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ItemController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'folder_id' => ['nullable', 'regex:/^(none|\d+)$/'],
            'category_id' => ['nullable', 'integer'],
            'sort' => ['nullable', Rule::in(['name', 'recent'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = $request->user()->items()->with(['folder:id,name', 'category:id,name']);

        if (! empty($filters['search'])) {
            $term = '%'.$filters['search'].'%';
            $query->where(fn ($q) => $q->where('name', 'like', $term)
                ->orWhere('username', 'like', $term)
                ->orWhere('url', 'like', $term));
        }

        if (($filters['folder_id'] ?? null) === 'none') {
            $query->whereNull('folder_id');
        } elseif (! empty($filters['folder_id'])) {
            $query->where('folder_id', $filters['folder_id']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (($filters['sort'] ?? 'name') === 'recent') {
            $query->latest('updated_at');
        } else {
            $query->orderBy('name');
        }

        $items = $query->orderBy('id')->paginate($filters['per_page'] ?? 20)->withQueryString();

        return ItemResource::collection($items);
    }

    public function show(Request $request, int $item): ItemResource
    {
        $model = $request->user()->items()->with(['folder:id,name', 'category:id,name'])->findOrFail($item);

        return ItemResource::make($model)->withSecrets();
    }

    public function store(ItemRequest $request): ItemResource
    {
        $model = $request->user()->items()->create($request->validated());

        return ItemResource::make($model->load(['folder:id,name', 'category:id,name']))->withSecrets();
    }

    public function update(ItemRequest $request, int $item): ItemResource
    {
        $model = $request->user()->items()->findOrFail($item);
        $model->update($request->validated());

        return ItemResource::make($model->load(['folder:id,name', 'category:id,name']))->withSecrets();
    }

    public function destroy(Request $request, int $item): Response
    {
        $request->user()->items()->findOrFail($item)->delete();

        return response()->noContent();
    }
}
