<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

class AdminController extends BaseController
{
    public function showUsersBrief(Request $request)
    {
        $users = DB::table('users')
            ->leftjoin('roles', 'users.role_id', '=', 'roles.id')
            ->select('users.id', DB::raw("CONCAT(users.first_name, ' ', users.last_name) AS name"), 'users.email', 'users.email_verified', 'roles.name as role')
            ->orderBy("users.id")
            ->where('users.id', '!=', 1)
            ->get();

        return response()->json($users);
    }

    public function showUser(Request $request)
    {
        $user = DB::table('users')
            ->leftjoin('roles', 'users.role_id', '=', 'roles.id')
            ->where("users.id", $request->id)
            ->select('users.id', 'users.role_id', DB::raw("CONCAT(users.first_name, ' ', users.last_name) AS name"), 'users.email', 'users.email_verified', 'roles.name as role', 'users.created_at', 'users.updated_at')
            ->first();

        // Activity log retrieval removed from here

        return response()->json($user);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role_id' => $request->input('role'),
        ]);

        // ActivityLog creation removed from here

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

  public function createRole(Request $request)
{
    $allowedServices = [
        "dashboard", "users", "products", "brands", "categories",
        "sizes", "tags", "orders", "payments", "carts",
        "favorites", "reviews", "addresses", "settings"
    ];

    // Correct way to get the array from a JSON request
    $permissions = $request->input('permissions');

    if (!is_array($permissions)) {
        return response()->json(['message' => 'Invalid permissions format'], 400);
    }

    $validation = $this->validatePermissions($permissions, $allowedServices);
    if ($validation['error']) return $validation['response'];

    // Use $request->name to get the role name from the JSON
    $role = Role::create(['name' => $request->name]);

    foreach ($permissions as $perm) {
        Permission::create([
            'role_id' => $role->id,
            'service' => $perm['service'],
            // Ensure booleans are handled correctly (true/false)
            'read'    => (bool)$perm['read'],
            'create'  => (bool)$perm['create'],
            'update'  => (bool)$perm['update'],
            'delete'  => (bool)$perm['delete'],
        ]);
    }

    return response()->json(['message' => 'Role and permissions created successfully'], 201);
}
/**
 * Helper function to validate the permissions array
 */
private function validatePermissions($permissions, $allowedServices)
{
    foreach ($permissions as $perm) {
        // 1. Check if the service name is allowed
        if (!in_array($perm['service'], $allowedServices)) {
            return [
                'error' => true,
                'response' => response()->json([
                    'message' => 'Invalid service: ' . $perm['service']
                ], 422)
            ];
        }

        // 2. Check if required permission keys exist
        $requiredKeys = ['read', 'create', 'update', 'delete'];
        foreach ($requiredKeys as $key) {
            if (!isset($perm[$key])) {
                return [
                    'error' => true,
                    'response' => response()->json([
                        'message' => "Missing permission key '{$key}' for service " . $perm['service']
                    ], 422)
                ];
            }
        }
    }

    return ['error' => false];
}

    // ... (Remainder of methods like updateRole, destroyMultipleUsers etc remain the same but ensure no ActivityLog calls exist)
}
