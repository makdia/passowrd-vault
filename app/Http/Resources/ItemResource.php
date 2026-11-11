<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    private bool $withSecrets = false;

    // Lists never carry secrets; only the single-item endpoint does.
    public function withSecrets(): static
    {
        $this->withSecrets = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'url' => $this->url,
            'has_password' => $this->getRawOriginal('password') !== null,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'folder_id' => $this->folder_id,
            'folder' => $this->whenLoaded('folder', fn () => $this->folder?->name),
            'password' => $this->when($this->withSecrets, fn () => $this->password),
            'notes' => $this->when($this->withSecrets, fn () => $this->notes),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
