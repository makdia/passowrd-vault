<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableFoldersChangeName extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Dated before the folders create migration, so skip on fresh installs.
        if (! Schema::hasTable('folders')) {
            return;
        }

        Schema::table('folders', function (Blueprint $table) {
            $table->string('name')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // up() changes nothing, and folders.name never had a unique index.
    }
}
