<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class JwtService
{
    protected string $secret;
    protected string $cookieName;
    protected string $algorithm = 'HS256';

    public function __construct()
    {
        $this->secret = config('jwt.secret', 'super-agent-shared-secret-change-in-production');
        $this->cookieName = config('jwt.cookie', 'super_agent_token');
    }

    public function validateToken(string $token): ?object
    {
        try {
            return JWT::decode($token, new Key($this->secret, $this->algorithm));
        } catch (\Exception $e) {
            return null;
        }
    }

    public function issueToken(array $payload): string
    {
        $issuedAt = time();
        $payload['iat'] = $issuedAt;
        $payload['exp'] = $issuedAt + 86400;
        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function extractFromCookie(): ?string
    {
        return request()->cookie($this->cookieName) ?? $_COOKIE[$this->cookieName] ?? null;
    }

    public function extractFromRequest(Request $request): ?string
    {
        $token = $request->query('token')
            ?? $request->bearerToken()
            ?? $request->input('token')
            ?? $this->extractFromCookie();

        return $token ?: null;
    }
}
