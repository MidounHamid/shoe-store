<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller as BaseController;

class RoleController extends BaseController
{
    // public function __construct()
    // {
    //     $this->middleware(function ($request, $next) {
    //         $user = $request->user();

    //         // Get role name safely
    //         $role = DB::table('roles')->where('id', $user->role_id)->first();

    //         if (!$role || $role->name !== 'admin') {
    //             return response()->json(['message' => 'Unauthorized'], 403);
    //         }

    //         return $next($request);
    //     });
    // }
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $roles = DB::table('roles')
            ->leftJoin('users', 'roles.id', '=', 'users.role_id')
            ->select('roles.id', 'roles.name', DB::raw('COUNT(users.id) as user_count'))
            ->groupBy('roles.id', 'roles.name')
            ->orderBy("roles.id")
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $roles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Role created successfully',
            'data' => $role->load('permissions')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $role = DB::table('roles')->where('id', $id)->first();

        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }

        $permissions = DB::table('permissions')
            ->where('role_id', $id)
            ->select('service', 'read', 'create', 'update', 'delete')
            ->get();
        $userCount = DB::table('users')
            ->where('role_id', $id)
            ->count();

        return response()->json([
            'id' => $role->id,
            'name' => $role->name,
            'user_count' => $userCount,
            'permissions' => $permissions
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Role updated successfully',
            'data' => $role->load('permissions')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): JsonResponse
    {
        $role->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Role deleted successfully'
        ]);
    }
}
