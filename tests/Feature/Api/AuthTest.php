<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_hashes_the_password_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ada',
            'email' => 'ada@example.test',
            'password' => 'correct horse',
            'password_confirmation' => 'correct horse',
        ]);

        $response->assertCreated()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
        $this->assertTrue(Hash::check('correct horse', User::first()->password));
    }

    public function test_register_rejects_a_taken_email_and_short_password(): void
    {
        User::factory()->create(['email' => 'ada@example.test']);

        $this->postJson('/api/auth/register', [
            'name' => 'Ada',
            'email' => 'ada@example.test',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_returns_a_token_that_reaches_protected_routes(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass']);

        $token = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret-pass',
        ])->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/auth/me')->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_login_rejects_a_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass']);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'nope'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_legacy_md5_password_logs_in_and_is_rehashed(): void
    {
        $user = User::factory()->create();
        DB::table('users')->where('id', $user->id)->update(['password' => md5('old-pass')]);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'old-pass'])->assertOk();

        $stored = $user->fresh()->password;
        $this->assertNotSame(md5('old-pass'), $stored);
        $this->assertTrue(Hash::check('old-pass', $stored));
    }

    public function test_legacy_md5_password_rejects_a_wrong_password(): void
    {
        $user = User::factory()->create();
        DB::table('users')->where('id', $user->id)->update(['password' => md5('old-pass')]);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])->assertUnprocessable();
        $this->assertSame(md5('old-pass'), $user->fresh()->password);
    }

    public function test_protected_routes_need_a_token(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_logout_revokes_the_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('web')->plainTextToken;

        $this->withToken($token)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
