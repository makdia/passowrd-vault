<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return $this->tokenResponse($user, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->input('email'))->first();

        if (! $user || ! $this->passwordMatches($user, $request->input('password'))) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        return $this->tokenResponse($user);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    private function passwordMatches(User $user, string $password): bool
    {
        // Accounts made before the bcrypt switch store md5; rehash on the first good login.
        if (preg_match('/^[a-f0-9]{32}$/', $user->password)) {
            if (! hash_equals($user->password, md5($password))) {
                return false;
            }

            $user->forceFill(['password' => $password])->save();

            return true;
        }

        return Hash::check($password, $user->password);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => new UserResource($user),
        ], $status);
    }
}
