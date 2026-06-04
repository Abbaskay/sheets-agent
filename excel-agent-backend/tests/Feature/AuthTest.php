<?php

namespace Tests\Feature;

use Firebase\JWT\JWT;
use Tests\TestCase;

class AuthTest extends TestCase
{
    protected string $secret;

    protected function setUp(): void
    {
        parent::setUp();
        $this->secret = config('jwt.secret', 'super-agent-shared-secret-change-in-production');
    }

    protected function issueToken(array $payload): string
    {
        return JWT::encode(array_merge([
            'iat' => now()->timestamp,
            'exp' => now()->addDay()->timestamp,
        ], $payload), $this->secret, 'HS256');
    }

    public function test_validate_token_endpoint_accepts_valid(): void
    {
        $token = $this->issueToken(['sub' => 1, 'email' => 'test@test.com', 'name' => 'Test']);

        $response = $this->postJson('/api/auth/validate', ['token' => $token]);

        $response->assertStatus(200)->assertJson(['valid' => true]);
    }

    public function test_validate_rejects_invalid(): void
    {
        $response = $this->postJson('/api/auth/validate', ['token' => 'bad.token']);

        $response->assertStatus(401)->assertJson(['valid' => false]);
    }

    public function test_authenticated_me(): void
    {
        $token = $this->issueToken(['sub' => 1, 'email' => 'test@test.com', 'name' => 'Test']);

        $response = $this->getJson('/api/auth/me', ['Authorization' => 'Bearer ' . $token]);

        $response->assertStatus(200)->assertJsonStructure(['user']);
    }

    public function test_unauthenticated_me(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_generate_endpoint_requires_auth(): void
    {
        $response = $this->postJson('/api/generate', ['topic' => 'test']);

        $response->assertStatus(401);
    }
}
