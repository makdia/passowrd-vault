<?php

namespace App\Http\Requests;

use App\Models\Category;
use App\Services\VaultTransfer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportRequest extends FormRequest
{
    public function rules(): array
    {
        // One query instead of an exists check per row.
        $categoryIds = Category::pluck('id')->all();

        return [
            'rows' => ['required', 'array', 'min:1', 'max:'.VaultTransfer::MAX_IMPORT_ROWS],
            'rows.*' => ['array'],
            'rows.*.name' => ['required', 'string', 'max:255'],
            'rows.*.type_id' => ['nullable', 'integer', Rule::in($categoryIds)],
            'rows.*.folder_name' => ['nullable', 'string', 'max:255'],
            'rows.*.username' => ['nullable', 'string', 'max:255'],
            'rows.*.password' => ['nullable', 'string', 'max:1000'],
            'rows.*.url' => ['nullable', 'string', 'max:255'],
            'rows.*.notes' => ['nullable', 'string', 'max:10000'],
        ];
    }

    public function messages(): array
    {
        return ['rows.max' => 'You can import up to :max rows at a time.'];
    }
}
