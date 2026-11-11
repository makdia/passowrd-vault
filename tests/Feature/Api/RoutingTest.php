<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_api_paths_are_json_404_not_the_spa(): void
    {
        Sanctum::actingAs(User::factory()->create());

        // PUT/DELETE exist on this path, so GET is 405 (JSON), not the SPA page.
        $this->getJson('/api/folders/5')->assertMethodNotAllowed()->assertJsonStructure(['message']);
        $this->getJson('/api/no-such-route')->assertNotFound()->assertJsonStructure(['message']);
        $this->get('/api/no-such-route')->assertNotFound();
    }

    public function test_non_numeric_ids_are_404_not_500(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/items/abc')->assertNotFound();
        $this->putJson('/api/folders/abc', ['name' => 'x'])->assertNotFound();
    }

    public function test_spa_routes_still_serve_the_app(): void
    {
        $this->get('/vault?edit=3')->assertOk()->assertSee('id="root"', false);
    }
}
