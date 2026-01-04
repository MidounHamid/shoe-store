<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductImageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'display_order' => 'integer|min:0|max:999',
            'main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
'second_images' => 'nullable|array',
        'second_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',        ];
    }

    public function messages()
    {
        return [
            'main_image.image' => 'The main image must be an image file',
            'main_image.mimes' => 'The main image must be a file of type: jpeg, png, jpg, gif, webp',
            'main_image.max' => 'The main image may not be greater than 5MB',
            'second_images.image' => 'The secondary image must be an image file',
            'second_images.mimes' => 'The secondary image must be a file of type: jpeg, png, jpg, gif, webp',
            'second_images.max' => 'The secondary image may not be greater than 5MB',
        ];
    }
}
