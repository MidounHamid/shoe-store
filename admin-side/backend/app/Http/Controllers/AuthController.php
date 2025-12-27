<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {

        $validator = Validator::make(request()->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }

        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = bcrypt($request->password);
        $user->save();

        return response()->json($user, 201);
    }


    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        return $this->respondWithToken($token);
    }


    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        $user = auth()->user();

        // Check if roles and permissions tables exist and user has role_id
        $role = null;
        $permissions = collect([]);

        if (isset($user->role_id) && $user->role_id) {
            try {
                // Check if roles table exists
                if (DB::getSchemaBuilder()->hasTable('roles')) {
                    $role = DB::table('roles')
                        ->where('id', $user->role_id)
                        ->select("id", "name")
                        ->first();
                }

                // Check if permissions table exists
                if ($role && DB::getSchemaBuilder()->hasTable('permissions')) {
                    $permissions = DB::table('permissions')
                        ->where('role_id', $user->role_id)
                        ->select("service", "read", "create", "update", "delete")
                        ->get();
                }
            } catch (\Exception $e) {
                // If tables don't exist or query fails, continue without role/permissions
                Log::warning('Roles or permissions tables not available: ' . $e->getMessage());
            }
        }

        $userData = $user->toArray();

        // Add role information if available
        if ($role) {
            $userData['role'] = [
                "id" => $role->id,
                "name" => $role->name,
                "permissions" => $permissions
            ];
        } else {
            // Provide default role structure if no role exists
            $userData['role'] = null;
        }

        // Get TTL from config (in minutes) and convert to seconds
        $ttl = config('jwt.ttl', 60) * 60;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $ttl,
            'user' => $userData,
        ]);
    }
    public function resetPassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|confirmed|min:8',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json(['message' => 'Old password is incorrect'], 422);
        }

        $user->password = bcrypt($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // Optional: delete related stuff (e.g., profile, reservations) here manually if no cascade.

        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully.'
        ]);
    }
}
