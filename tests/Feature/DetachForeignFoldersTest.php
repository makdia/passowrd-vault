<?php

namespace Tests\Feature;

use App\Models\Folder;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DetachForeignFoldersTest extends TestCase
{
    use RefreshDatabase;

    public function test_items_lose_folders_owned_by_someone_else_or_missing(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();
        $aliceFolder = Folder::factory()->for($alice)->create();
        $bobFolder = Folder::factory()->for($bob)->create();

        $own = Item::factory()->for($bob)->create(['folder_id' => $bobFolder->id]);
        // The old API saved any folder_id it was sent.
        $foreign = Item::factory()->for($bob)->create();
        $dangling = Item::factory()->for($bob)->create();
        DB::table('items')->where('id', $foreign->id)->update(['folder_id' => $aliceFolder->id]);
        DB::table('items')->where('id', $dangling->id)->update(['folder_id' => 9999]);

        (require database_path('migrations/2026_11_11_000300_detach_items_from_foreign_folders.php'))->up();

        $this->assertSame($bobFolder->id, $own->fresh()->folder_id);
        $this->assertNull($foreign->fresh()->folder_id);
        $this->assertNull($dangling->fresh()->folder_id);
        $this->assertSame(0, $aliceFolder->items()->count());
    }
}
