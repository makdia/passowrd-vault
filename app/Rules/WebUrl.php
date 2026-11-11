<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/** An http(s) URL or a bare host like "github.com"; any other scheme (javascript:, data:) fails. */
class WebUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $value = trim((string) $value);

        $hasScheme = preg_match('/^[a-z][a-z0-9+.\-]*:/i', $value) === 1;
        $isHostWithPort = preg_match('/^[^\/:\s]+:\d+(\/|$)/', $value) === 1;

        if ($hasScheme && ! $isHostWithPort && ! preg_match('#^https?://#i', $value)) {
            $fail('The website must start with http:// or https://, or be a plain address like example.com.');
        }
    }
}
