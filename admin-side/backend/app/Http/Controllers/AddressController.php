<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('addresses')
            ->leftJoin('users', 'addresses.user_id', '=', 'users.id')
            ->select('addresses.*', 'users.email as user_email');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('addresses.user_id', $request->user_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('addresses.full_name', 'like', "%{$search}%")
                    ->orWhere('addresses.city', 'like', "%{$search}%")
                    ->orWhere('addresses.country', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $addresses = $query->orderBy('addresses.created_at', 'desc')->paginate($perPage);

        return response()->json($addresses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'label' => 'nullable|string|max:50',
            'full_name' => 'required|string|max:255',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'is_default' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // If this is set as default, unset other defaults for this user
        if ($request->get('is_default', false)) {
            DB::table('addresses')
                ->where('user_id', $request->user_id)
                ->update(['is_default' => false]);
        }

        $data = [
            'user_id' => $request->user_id,
            'label' => $request->label,
            'full_name' => $request->full_name,
            'street_address' => $request->street_address,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'phone' => $request->phone,
            'is_default' => $request->get('is_default', false),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('addresses')->insertGetId($data);
        $address = DB::table('addresses')
            ->leftJoin('users', 'addresses.user_id', '=', 'users.id')
            ->select('addresses.*', 'users.email as user_email')
            ->where('addresses.id', $id)
            ->first();

        return response()->json($address, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $address = DB::table('addresses')
            ->leftJoin('users', 'addresses.user_id', '=', 'users.id')
            ->select('addresses.*', 'users.email as user_email')
            ->where('addresses.id', $id)
            ->first();

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        return response()->json($address);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $address = DB::table('addresses')->where('id', $id)->first();

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|required|exists:users,id',
            'label' => 'nullable|string|max:50',
            'full_name' => 'sometimes|required|string|max:255',
            'street_address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'sometimes|required|string|max:20',
            'country' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'is_default' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // If this is set as default, unset other defaults for this user
        if ($request->has('is_default') && $request->is_default) {
            $userId = $request->has('user_id') ? $request->user_id : $address->user_id;
            DB::table('addresses')
                ->where('user_id', $userId)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('user_id')) $data['user_id'] = $request->user_id;
        if ($request->has('label')) $data['label'] = $request->label;
        if ($request->has('full_name')) $data['full_name'] = $request->full_name;
        if ($request->has('street_address')) $data['street_address'] = $request->street_address;
        if ($request->has('city')) $data['city'] = $request->city;
        if ($request->has('state')) $data['state'] = $request->state;
        if ($request->has('postal_code')) $data['postal_code'] = $request->postal_code;
        if ($request->has('country')) $data['country'] = $request->country;
        if ($request->has('phone')) $data['phone'] = $request->phone;
        if ($request->has('is_default')) $data['is_default'] = $request->is_default;

        DB::table('addresses')->where('id', $id)->update($data);
        $address = DB::table('addresses')
            ->leftJoin('users', 'addresses.user_id', '=', 'users.id')
            ->select('addresses.*', 'users.email as user_email')
            ->where('addresses.id', $id)
            ->first();

        return response()->json($address);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $address = DB::table('addresses')->where('id', $id)->first();

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        DB::table('addresses')->where('id', $id)->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }
}
