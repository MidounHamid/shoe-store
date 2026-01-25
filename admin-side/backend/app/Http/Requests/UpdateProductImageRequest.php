<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductImageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'product_id' => 'sometimes|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'display_order' => 'integer|min:0|max:999',
            'image_principale' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'second_images' => 'nullable|array',
            'second_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'keep_second_images' => 'nullable|string', // This is JSON string from your JS
            'delete_main_image' => 'nullable',
        ];
    }

    public function messages()
    {
        return [
            'image_principale.image' => 'The main image must be an image file',
            'image_principale.mimes' => 'The main image must be a file of type: jpeg, png, jpg, gif, webp',
            'image_principale.max' => 'The main image may not be greater than 5MB',
            'second_images.image' => 'The secondary image must be an image file',
            'second_images.mimes' => 'The secondary image must be a file of type: jpeg, png, jpg, gif, webp',
            'second_images.max' => 'The secondary image may not be greater than 5MB',
        ];
    }
}
