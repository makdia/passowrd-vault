<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ItemRequest extends FormRequest
{
    public function rules(): array
    {
        $nameRule = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'name' => [$nameRule, 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'folder_id' => ['nullable', 'integer', Rule::exists('folders', 'id')->where('user_id', $this->user()->id)],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:1000'],
            'url' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
