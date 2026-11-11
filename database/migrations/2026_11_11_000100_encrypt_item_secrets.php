<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const SECRET_COLUMNS = ['password', 'notes'];

    public function up(): void
    {
        // Ciphertext is far longer than 255 chars.
        Schema::table('items', function (Blueprint $table) {
            $table->text('password')->nullable()->change();
            $table->text('notes')->nullable()->change();
        });

        $this->rewriteSecrets(fn (string $value) => Crypt::encryptString($value));
    }

    public function down(): void
    {
        // Columns stay TEXT: shrinking them back could cut long notes.
        $this->rewriteSecrets(fn (string $value) => Crypt::decryptString($value));
    }

    private function rewriteSecrets(callable $transform): void
    {
        DB::transaction(function () use ($transform) {
            DB::table('items')->select(array_merge(['id'], self::SECRET_COLUMNS))
                ->orderBy('id')
                ->chunkById(500, function ($rows) use ($transform) {
                    foreach ($rows as $row) {
                        $changes = [];
                        foreach (self::SECRET_COLUMNS as $column) {
                            if ($row->{$column} !== null && $row->{$column} !== '') {
                                $changes[$column] = $transform($row->{$column});
                            }
                        }
                        if ($changes) {
                            DB::table('items')->where('id', $row->id)->update($changes);
                        }
                    }
                });
        });
    }
};
