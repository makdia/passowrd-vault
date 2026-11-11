<?php

namespace Tests\Feature;

use App\Models\Item;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ItemEncryptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_and_notes_are_encrypted_at_rest(): void
    {
        $item = Item::factory()->create(['password' => 'hunter2', 'notes' => 'PIN 1234']);

        $raw = DB::table('items')->where('id', $item->id)->first();

        $this->assertNotSame('hunter2', $raw->password);
        $this->assertNotSame('PIN 1234', $raw->notes);
        $this->assertSame('hunter2', Crypt::decryptString($raw->password));
        $this->assertSame('hunter2', $item->fresh()->password);
    }

    public function test_migration_encrypts_existing_plain_rows_and_rolls_back(): void
    {
        $item = Item::factory()->create();
        DB::table('items')->where('id', $item->id)->update(['password' => 'plain-old', 'notes' => null]);
        $migration = require database_path('migrations/2026_11_11_000100_encrypt_item_secrets.php');

        $migration->up();
        $this->assertNotSame('plain-old', DB::table('items')->value('password'));
        $this->assertSame('plain-old', $item->fresh()->password);
        $this->assertNull($item->fresh()->notes);

        $migration->down();
        $this->assertSame('plain-old', DB::table('items')->value('password'));
    }
}
