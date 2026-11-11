<?php

namespace Tests\Feature\Api;

use App\Models\Folder;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VaultTransferTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    public function test_import_reuses_folders_by_name_and_encrypts_secrets(): void
    {
        $work = Folder::factory()->for($this->user)->create(['name' => 'Work']);

        $this->postJson('/api/vault/import', ['rows' => [
            ['name' => 'Github', 'folder_name' => 'work', 'username' => 'ada', 'password' => 'pw1', 'type_id' => '1'],
            ['name' => 'Bank', 'folder_name' => 'Money', 'password' => 'pw2', 'notes' => 'pin'],
            ['name' => 'Card', 'folder_name' => 'money', 'type_id' => ''],
            ['name' => 'Loose', 'folder_name' => ''],
        ]])->assertCreated()->assertJsonPath('data.items', 4)->assertJsonPath('data.folders_created', 1);

        $this->assertSame(2, $this->user->folders()->count());
        $money = $this->user->folders()->where('name', 'Money')->first();
        $this->assertSame(1, Item::where('folder_id', $work->id)->count());
        $this->assertSame(2, Item::where('folder_id', $money->id)->count());
        $this->assertSame('pw2', Item::where('name', 'Bank')->first()->password);
        $this->assertNotSame('pw2', DB::table('items')->where('name', 'Bank')->value('password'));
        $this->assertSame($this->user->id, Item::where('name', 'Loose')->value('user_id'));
    }

    public function test_import_validates_and_caps_rows(): void
    {
        $this->postJson('/api/vault/import', ['rows' => [['folder_name' => 'x']]])
            ->assertUnprocessable()->assertJsonValidationErrors('rows.0.name');

        $this->postJson('/api/vault/import', ['rows' => array_fill(0, 1001, ['name' => 'x'])])
            ->assertUnprocessable()->assertJsonValidationErrors('rows');

        $this->postJson('/api/vault/import', ['rows' => [['name' => 'x', 'type_id' => 99]]])
            ->assertUnprocessable()->assertJsonValidationErrors('rows.0.type_id');

        $this->assertDatabaseCount('items', 0);
    }

    public function test_export_streams_only_my_items_as_csv(): void
    {
        $folder = Folder::factory()->for($this->user)->create(['name' => 'Work']);
        Item::factory()->for($this->user)->create(['name' => 'Github', 'password' => 'pw1', 'folder_id' => $folder->id, 'category_id' => 1]);
        Item::factory()->create(['name' => 'Not mine', 'password' => 'theirs']);

        $response = $this->get('/api/vault/export')->assertOk();
        $csv = $response->streamedContent();

        $lines = array_map('str_getcsv', array_filter(explode("\n", trim($csv))));
        $this->assertSame(\App\Services\VaultTransfer::CSV_COLUMNS, $lines[0]);
        $this->assertCount(2, $lines);
        $this->assertSame(['Github', '1', 'Login', 'Work', 'pw1'], [$lines[1][1], $lines[1][2], $lines[1][3], $lines[1][5], $lines[1][7]]);
        $this->assertStringNotContainsString('theirs', $csv);
    }

    public function test_export_then_import_round_trips(): void
    {
        Item::factory()->for($this->user)->create(['name' => 'Github', 'password' => 'pw,with "quotes"', 'notes' => "two\nlines"]);
        $csv = $this->get('/api/vault/export')->streamedContent();

        $handle = fopen('php://memory', 'r+');
        fwrite($handle, $csv);
        rewind($handle);
        $header = fgetcsv($handle);
        $rows = [];
        while (($line = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($header, $line);
        }

        $this->postJson('/api/vault/import', ['rows' => $rows])->assertCreated();

        $copies = Item::where('name', 'Github')->get();
        $this->assertCount(2, $copies);
        $this->assertSame('pw,with "quotes"', $copies[1]->password);
        $this->assertSame("two\nlines", $copies[1]->notes);
    }
}
