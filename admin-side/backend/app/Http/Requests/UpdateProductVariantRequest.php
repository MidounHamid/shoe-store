<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductVariantRequest extends FormRequest
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
        $variantId = $this->route('id') ?? $this->route('variant');
        return [
            'product_id' => 'sometimes|required|exists:products,id',
            'sku' => 'sometimes|required|string|unique:product_variants,sku,' . $variantId,
            'size' => 'nullable|string|max:20',
            'color' => 'nullable|string|max:100',
            'price' => 'sometimes|required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'attributes' => 'nullable|array',
        ];
    }
}
