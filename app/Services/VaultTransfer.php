<?php

namespace App\Services;

use App\Models\Item;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class VaultTransfer
{
    public const MAX_IMPORT_ROWS = 1000;

    // Same columns the old export wrote, so old files still import.
    public const CSV_COLUMNS = ['id', 'name', 'type_id', 'type_name', 'folder_id', 'folder_name', 'username', 'password', 'url', 'notes'];

    /**
     * @param  array<int, array<string, mixed>>  $rows  validated rows
     * @return array{items: int, folders_created: int}
     */
    public function import(User $user, array $rows): array
    {
        return DB::transaction(function () use ($user, $rows) {
            $folderIds = $this->resolveFolders($user, $rows, $foldersCreated);
            $now = now();

            $records = array_map(fn (array $row) => [
                'user_id' => $user->id,
                'name' => $row['name'],
                'category_id' => isset($row['type_id']) ? (int) $row['type_id'] : null,
                'folder_id' => $folderIds[$this->folderKey($row['folder_name'] ?? null)] ?? null,
                'username' => $row['username'] ?? null,
                // Bulk insert skips model casts, so encrypt here.
                'password' => isset($row['password']) ? Crypt::encryptString($row['password']) : null,
                'url' => $row['url'] ?? null,
                'notes' => isset($row['notes']) ? Crypt::encryptString($row['notes']) : null,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ], $rows);

            foreach (array_chunk($records, 200) as $chunk) {
                Item::insert($chunk);
            }

            return ['items' => count($records), 'folders_created' => $foldersCreated];
        });
    }

    /** Writes the user's vault as CSV to the given stream. */
    public function exportCsv(User $user, $stream): void
    {
        fputcsv($stream, self::CSV_COLUMNS);

        $user->items()->with(['folder:id,name', 'category:id,name'])->orderBy('id')
            ->chunkById(500, function ($items) use ($stream) {
                foreach ($items as $item) {
                    fputcsv($stream, [
                        $item->id,
                        $item->name,
                        $item->category_id,
                        $item->category?->name,
                        $item->folder_id,
                        $item->folder?->name,
                        $item->username,
                        $item->password,
                        $item->url,
                        $item->notes,
                    ]);
                }
            });
    }

    /** @return array<string, int> folder key => id, creating missing folders in one insert */
    private function resolveFolders(User $user, array $rows, ?int &$created): array
    {
        $existing = [];
        foreach ($user->folders()->get(['id', 'name']) as $folder) {
            $existing[$this->folderKey($folder->name)] ??= $folder->id;
        }

        $missing = [];
        foreach ($rows as $row) {
            $name = trim((string) ($row['folder_name'] ?? ''));
            $key = $this->folderKey($name);
            if ($key !== '' && ! isset($existing[$key]) && ! isset($missing[$key])) {
                $missing[$key] = $name;
            }
        }

        $created = count($missing);
        if ($missing) {
            $now = now();
            DB::table('folders')->insert(array_map(fn ($name) => [
                'user_id' => $user->id, 'name' => $name, 'status' => 1, 'created_at' => $now, 'updated_at' => $now,
            ], array_values($missing)));

            foreach ($user->folders()->whereIn('name', array_values($missing))->get(['id', 'name']) as $folder) {
                $existing[$this->folderKey($folder->name)] ??= $folder->id;
            }
        }

        return $existing;
    }

    private function folderKey(?string $name): string
    {
        return mb_strtolower(trim((string) $name));
    }
}
