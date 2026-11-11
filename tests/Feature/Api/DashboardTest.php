<?php

namespace Tests\Feature\Api;

use App\Models\Folder;
use App\Models\Item;
use App\Models\User;
use App\Services\PasswordHealth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_counts_and_flags_weak_and_reused_passwords(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        Folder::factory()->for($user)->create();
        Item::factory()->for($user)->create(['name' => 'Strong', 'password' => 'Str0ng!Unique#1', 'category_id' => 1]);
        Item::factory()->for($user)->create(['name' => 'Weak', 'password' => 'abc', 'category_id' => 1]);
        Item::factory()->for($user)->create(['name' => 'ReuseA', 'password' => 'Same!Pass#2024', 'category_id' => 3]);
        Item::factory()->for($user)->create(['name' => 'ReuseB', 'password' => 'Same!Pass#2024']);
        Item::factory()->for($user)->create(['name' => 'Note', 'password' => null, 'category_id' => 2]);
        Item::factory()->create(['password' => 'abc']);

        $data = $this->getJson('/api/dashboard')->assertOk()->json('data');

        $this->assertSame(5, $data['items']);
        $this->assertSame(1, $data['folders']);
        $this->assertSame(['Login' => 2, 'Secure Note' => 1, 'Card' => 1, 'Identity' => 0], array_column($data['categories'], 'count', 'name'));
        $this->assertSame(1, $data['health']['weak']);
        $this->assertSame(2, $data['health']['reused']);
        $this->assertSame(1, $data['health']['empty']);
        $this->assertSame(25, $data['health']['score']);
        $this->assertSame(['Weak'], array_column($data['health']['weak_items'], 'name'));
        $this->assertCount(5, $data['recent']);
        $this->assertArrayNotHasKey('password', $data['recent'][0]);
    }

    public function test_weak_rule(): void
    {
        $health = new PasswordHealth();

        $this->assertTrue($health->isWeak('Short1!'));
        $this->assertTrue($health->isWeak('alllowercaseletters'));
        $this->assertFalse($health->isWeak('Longer-pass-99'));
    }
}
