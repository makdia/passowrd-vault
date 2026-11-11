<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WebUrlTest extends TestCase
{
    use RefreshDatabase;

    public static function urls(): array
    {
        return [
            'https' => ['https://github.com/login', true],
            'http' => ['http://intranet.test', true],
            'bare host' => ['github.com', true],
            'host with port' => ['localhost:8080/admin', true],
            'javascript' => ['javascript:alert(1)', false],
            'javascript with slashes' => ["javascript://example.com/%0afetch('//evil')", false],
            'data' => ['data:text/html,<script>alert(1)</script>', false],
            'vbscript' => ['VBScript:msgbox', false],
        ];
    }

    #[DataProvider('urls')]
    public function test_item_url_allows_only_web_addresses(string $url, bool $valid): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/items', ['name' => 'Site', 'url' => $url]);

        $valid ? $response->assertCreated() : $response->assertUnprocessable()->assertJsonValidationErrors('url');
    }

    public function test_import_rejects_script_urls(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/vault/import', ['rows' => [['name' => 'x', 'url' => 'javascript:alert(1)']]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('rows.0.url');
        $this->assertDatabaseCount('items', 0);
    }
}
