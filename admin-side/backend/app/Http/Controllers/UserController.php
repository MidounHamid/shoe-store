<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('users');

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'email_verified', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {

        $data = [
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'role' => $request->get('role', 'customer'),
            'email_verified' => $request->get('email_verified', false),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $id = DB::table('users')->insertGetId($data);
        $user = DB::table('users')
            ->where('id', $id)
            ->select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'email_verified', 'created_at', 'updated_at')
            ->first();

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = DB::table('users')
            ->where('id', $id)
            ->select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'email_verified', 'created_at', 'updated_at')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, $id)
    {
        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data = [
            'updated_at' => now(),
        ];

        if ($request->has('email')) $data['email'] = $request->email;
        if ($request->has('password')) $data['password'] = Hash::make($request->password);
        if ($request->has('first_name')) $data['first_name'] = $request->first_name;
        if ($request->has('last_name')) $data['last_name'] = $request->last_name;
        if ($request->has('phone')) $data['phone'] = $request->phone;
        if ($request->has('role')) $data['role'] = $request->role;
        if ($request->has('email_verified')) $data['email_verified'] = $request->email_verified;

        DB::table('users')->where('id', $id)->update($data);
        $user = DB::table('users')
            ->where('id', $id)
            ->select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'email_verified', 'created_at', 'updated_at')
            ->first();

        return response()->json($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = DB::table('users')->where('id', $id)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        DB::table('users')->where('id', $id)->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
