<?php

namespace App\Services;

use App\Models\User;

class PasswordHealth
{
    private const MIN_LENGTH = 10;
    private const MIN_CHARACTER_SETS = 3;
    private const SAMPLE_SIZE = 10;

    /** @return array{score: int, weak: int, reused: int, empty: int, weak_items: array, reused_items: array} */
    public function report(User $user): array
    {
        $byHash = [];
        $weak = [];
        $empty = 0;

        // Secrets are encrypted, so this has to read them in PHP.
        $user->items()->select(['id', 'name', 'password'])->orderBy('id')
            ->chunkById(500, function ($items) use (&$byHash, &$weak, &$empty) {
                foreach ($items as $item) {
                    if ($item->password === null || $item->password === '') {
                        $empty++;
                        continue;
                    }
                    $summary = ['id' => $item->id, 'name' => $item->name];
                    $byHash[hash('sha256', $item->password)][] = $summary;
                    if ($this->isWeak($item->password)) {
                        $weak[] = $summary;
                    }
                }
            });

        $reused = [];
        foreach ($byHash as $group) {
            if (count($group) > 1) {
                array_push($reused, ...$group);
            }
        }
        $withPassword = array_sum(array_map('count', $byHash));
        $flagged = count(array_unique(array_merge(array_column($weak, 'id'), array_column($reused, 'id'))));

        return [
            'score' => $withPassword === 0 ? 100 : (int) round(100 * ($withPassword - $flagged) / $withPassword),
            'weak' => count($weak),
            'reused' => count($reused),
            'empty' => $empty,
            'weak_items' => array_slice($weak, 0, self::SAMPLE_SIZE),
            'reused_items' => array_slice($reused, 0, self::SAMPLE_SIZE),
        ];
    }

    public function isWeak(string $password): bool
    {
        $sets = preg_match('/[a-z]/', $password) + preg_match('/[A-Z]/', $password)
            + preg_match('/\d/', $password) + preg_match('/[^a-zA-Z\d]/', $password);

        return mb_strlen($password) < self::MIN_LENGTH || $sets < self::MIN_CHARACTER_SETS;
    }
}
