<?php

namespace Tests\Feature\Api;

use App\Models\Folder;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ItemTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_index_lists_my_items_without_secrets(): void
    {
        Item::factory()->for($this->user)->create(['name' => 'Github', 'password' => 'top-secret']);
        Item::factory()->create(['name' => 'Not mine']);

        $response = $this->getJson('/api/items')->assertOk()->assertJsonCount(1, 'data');

        $response->assertJsonPath('data.0.name', 'Github')->assertJsonPath('data.0.has_password', true);
        $this->assertArrayNotHasKey('password', $response->json('data.0'));
        $this->assertStringNotContainsString('top-secret', $response->getContent());
    }

    public function test_index_filters_by_search_folder_and_category(): void
    {
        $folder = Folder::factory()->for($this->user)->create();
        Item::factory()->for($this->user)->create(['name' => 'Bank', 'folder_id' => $folder->id, 'category_id' => 3]);
        Item::factory()->for($this->user)->create(['name' => 'Mail', 'username' => 'bank-alerts', 'category_id' => 1]);
        Item::factory()->for($this->user)->create(['name' => 'Chat', 'username' => 'me', 'url' => null, 'category_id' => 1]);

        $this->getJson('/api/items?search=bank')->assertJsonCount(2, 'data');
        $this->getJson("/api/items?folder_id={$folder->id}")->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Bank');
        $this->getJson('/api/items?folder_id=none')->assertJsonCount(2, 'data');
        $this->getJson('/api/items?category_id=1')->assertJsonCount(2, 'data');
    }

    public function test_index_caps_page_size(): void
    {
        $this->getJson('/api/items?per_page=1000')->assertUnprocessable()->assertJsonValidationErrors('per_page');
        $this->getJson('/api/items?folder_id=abc')->assertUnprocessable();
    }

    public function test_show_returns_secrets_for_my_item_only(): void
    {
        $mine = Item::factory()->for($this->user)->create(['password' => 'p@ss', 'notes' => 'note']);
        $theirs = Item::factory()->create();

        $this->getJson("/api/items/{$mine->id}")->assertOk()
            ->assertJsonPath('data.password', 'p@ss')
            ->assertJsonPath('data.notes', 'note');
        $this->getJson("/api/items/{$theirs->id}")->assertNotFound();
    }

    public function test_store_creates_for_me_and_ignores_trust_fields(): void
    {
        $folder = Folder::factory()->for($this->user)->create();

        $this->postJson('/api/items', [
            'name' => 'Github',
            'username' => 'ada',
            'password' => 'pw',
            'folder_id' => $folder->id,
            'category_id' => 1,
            'user_id' => 999,
            'status' => 0,
        ])->assertCreated()->assertJsonPath('data.folder', $folder->name)->assertJsonPath('data.category', 'Login');

        $this->assertDatabaseHas('items', ['name' => 'Github', 'user_id' => $this->user->id, 'status' => 1]);
    }

    public function test_store_rejects_another_users_folder(): void
    {
        $theirs = Folder::factory()->create();

        $this->postJson('/api/items', ['name' => 'X', 'folder_id' => $theirs->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('folder_id');
    }

    public function test_update_changes_only_sent_fields(): void
    {
        $item = Item::factory()->for($this->user)->create(['name' => 'Old', 'password' => 'keep-me']);

        $this->patchJson("/api/items/{$item->id}", ['name' => 'New'])->assertOk()->assertJsonPath('data.name', 'New');

        $this->assertSame('keep-me', $item->fresh()->password);
    }

    public function test_other_users_items_cannot_be_changed(): void
    {
        $theirs = Item::factory()->create(['name' => 'Theirs']);

        $this->putJson("/api/items/{$theirs->id}", ['name' => 'Mine'])->assertNotFound();
        $this->deleteJson("/api/items/{$theirs->id}")->assertNotFound();
        $this->assertDatabaseHas('items', ['id' => $theirs->id, 'name' => 'Theirs']);
    }

    public function test_destroy_deletes_my_item(): void
    {
        $item = Item::factory()->for($this->user)->create();

        $this->deleteJson("/api/items/{$item->id}")->assertNoContent();
        $this->assertDatabaseMissing('items', ['id' => $item->id]);
    }

    public function test_categories_lists_the_defaults(): void
    {
        $this->getJson('/api/categories')->assertOk()->assertJsonPath('data.0.name', 'Login')->assertJsonCount(4, 'data');
    }
}
