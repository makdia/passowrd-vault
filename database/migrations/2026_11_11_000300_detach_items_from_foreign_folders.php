<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // The old API saved any folder_id, so items could point at another user's folder.
    public function up(): void
    {
        DB::table('items')
            ->whereNotNull('folder_id')
            ->whereNotExists(fn ($query) => $query->select(DB::raw(1))
                ->from('folders')
                ->whereColumn('folders.id', 'items.folder_id')
                ->whereColumn('folders.user_id', 'items.user_id'))
            ->update(['folder_id' => null]);
    }

    public function down(): void
    {
        // Not reversible: the links were invalid.
    }
};
