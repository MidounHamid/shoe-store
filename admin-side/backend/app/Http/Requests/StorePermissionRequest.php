<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service' => 'required|string|max:255|unique:permissions',
            'create' => 'boolean',
            'read' => 'boolean',
            'update' => 'boolean',
            'delete' => 'boolean',
            'role_id' => 'nullable|exists:roles,id'
        ];
    }
}
