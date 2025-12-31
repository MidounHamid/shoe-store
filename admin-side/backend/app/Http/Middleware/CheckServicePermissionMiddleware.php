<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckServicePermissionMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        Log::info("Middleware check permission per service is called");
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized (no user)'], 401);
        }

        // Get controller class and method
        $route = $request->route();
        $action = $route?->getAction();
        $controllerString = $action['controller'] ?? '';

        if (!$controllerString) {
            return response()->json(['message' => 'Cannot detect controller'], 403);
        }

        // Extract class and method from "App\Http\Controllers\X@method"
        [$controllerClass, $method] = explode('@', $controllerString);

        // Resolve the controller
        $controller = app($controllerClass);

        // Read $serviceName property from controller
        $service = property_exists($controller, 'serviceName') ? $controller->serviceName : null;

        if (!$service) {
            Log::info(">>>>>Middleware ignored this request");
            return $next($request);
        }

        // Map HTTP method to permission
        $methodMap = [
            'GET' => 'read',
            'POST' => 'create',
            'PUT' => 'update',
            'PATCH' => 'update',
            'DELETE' => 'delete',
        ];

        $httpMethod = $request->method();
        $requiredPermission = $methodMap[$httpMethod] ?? null;

        if (!$requiredPermission) {
            Log::info("UNSUPPORTED");
            return response()->json(['message' => "Unsupported HTTP method [$httpMethod]"], 403);
        }

        // Check permission via Query Builder
        $permission = DB::table('permissions')
            ->where('role_id', $user->role_id)
            ->where('service', $service)
            ->first();

        if (!$permission || !$permission->$requiredPermission) {
            Log::info("FORBIDDEN");

            return response()->json([
                'message' => "Forbidden: no [$requiredPermission] access to [$service]",
            ], 403);
        }
        Log::info("ALLOWED");


        return $next($request);
    }

}
