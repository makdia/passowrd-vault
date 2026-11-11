<?php

namespace Tests\Feature\Api;

use App\Models\Folder;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FolderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_index_lists_only_my_folders_with_item_counts(): void
    {
        $mine = Folder::factory()->for($this->user)->create(['name' => 'Work']);
        Item::factory()->count(2)->for($this->user)->create(['folder_id' => $mine->id]);
        Folder::factory()->create(['name' => 'Someone else']);

        $this->getJson('/api/folders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Work')
            ->assertJsonPath('data.0.items_count', 2);
    }

    public function test_store_trims_and_saves_for_the_current_user(): void
    {
        $this->postJson('/api/folders', ['name' => '  Banking  ', 'user_id' => 999])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Banking');

        $this->assertDatabaseHas('folders', ['name' => 'Banking', 'user_id' => $this->user->id]);
    }

    public function test_names_are_unique_per_user_only(): void
    {
        Folder::factory()->for($this->user)->create(['name' => 'Work']);
        Folder::factory()->create(['name' => 'Personal']);

        $this->postJson('/api/folders', ['name' => 'Work'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/folders', ['name' => 'Personal'])->assertCreated();
    }

    public function test_rename_keeps_its_own_name_valid(): void
    {
        $folder = Folder::factory()->for($this->user)->create(['name' => 'Work']);

        $this->putJson("/api/folders/{$folder->id}", ['name' => 'Work'])->assertOk();
        $this->putJson("/api/folders/{$folder->id}", ['name' => 'Office'])->assertOk()->assertJsonPath('data.name', 'Office');
    }

    public function test_other_users_folders_are_not_found(): void
    {
        $theirs = Folder::factory()->create();

        $this->putJson("/api/folders/{$theirs->id}", ['name' => 'Mine now'])->assertNotFound();
        $this->deleteJson("/api/folders/{$theirs->id}")->assertNotFound();
        $this->assertDatabaseHas('folders', ['id' => $theirs->id, 'name' => $theirs->name]);
    }

    public function test_delete_keeps_items_and_clears_their_folder(): void
    {
        $folder = Folder::factory()->for($this->user)->create();
        $item = Item::factory()->for($this->user)->create(['folder_id' => $folder->id]);

        $this->deleteJson("/api/folders/{$folder->id}")->assertNoContent();

        $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
        $this->assertNull($item->fresh()->folder_id);
    }

    public function test_requires_authentication(): void
    {
        $this->app['auth']->forgetGuards();

        $this->withHeaders(['Authorization' => ''])->getJson('/api/folders')->assertUnauthorized();
    }
}
