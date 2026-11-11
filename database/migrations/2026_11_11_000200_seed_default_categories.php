<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Ids match the old frontend, which assumed 1 = Login.
    private const DEFAULTS = [1 => 'Login', 2 => 'Secure Note', 3 => 'Card', 4 => 'Identity'];

    public function up(): void
    {
        // Existing installs already have their own categories.
        if (DB::table('categories')->exists()) {
            return;
        }

        $now = now();
        DB::table('categories')->insert(array_map(
            fn ($id, $name) => ['id' => $id, 'name' => $name, 'status' => 1, 'created_at' => $now, 'updated_at' => $now],
            array_keys(self::DEFAULTS),
            self::DEFAULTS
        ));
    }

    public function down(): void
    {
        DB::table('categories')->whereIn('id', array_keys(self::DEFAULTS))->whereIn('name', self::DEFAULTS)->delete();
    }
};
