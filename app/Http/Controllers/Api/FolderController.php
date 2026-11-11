<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FolderRequest;
use App\Http\Resources\FolderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class FolderController extends Controller
{
    private const MAX_FOLDERS = 500;

    public function index(Request $request): AnonymousResourceCollection
    {
        $folders = $request->user()->folders()
            ->withCount('items')
            ->orderBy('name')
            ->orderBy('id')
            ->limit(self::MAX_FOLDERS)
            ->get();

        return FolderResource::collection($folders);
    }

    public function store(FolderRequest $request): FolderResource
    {
        $folder = $request->user()->folders()->create($request->validated());

        return new FolderResource($folder->loadCount('items'));
    }

    public function update(FolderRequest $request, int $folder): FolderResource
    {
        $model = $request->user()->folders()->findOrFail($folder);
        $model->update($request->validated());

        return new FolderResource($model->loadCount('items'));
    }

    public function destroy(Request $request, int $folder): Response
    {
        $model = $request->user()->folders()->findOrFail($folder);

        // Items outlive their folder; they move back to "No folder".
        DB::transaction(function () use ($model) {
            $model->items()->update(['folder_id' => null]);
            $model->delete();
        });

        return response()->noContent();
    }
}
