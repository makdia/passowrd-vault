<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category_id',
        'folder_id',
        'username',
        'password',
        'url',
        'notes',
        'user_id',
        'status',
        'created_at',
        'updated_at'
    ];
}
