<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataTableController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ProductFeatureController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OrderEventController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\ReviewVoteController;
use App\Http\Controllers\CountController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Counts for sidebar badges
    Route::get('/counts', [CountController::class, 'getCounts']);

    // Resource routes
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('addresses', AddressController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('sizes', SizeController::class);
    Route::apiResource('product-variants', ProductVariantController::class);
    Route::apiResource('product-images', ProductImageController::class);
    Route::apiResource('product-features', ProductFeatureController::class);
    Route::apiResource('tags', TagController::class);
    Route::apiResource('carts', CartController::class);
    Route::apiResource('cart-items', CartItemController::class);
    Route::apiResource('favorites', FavoriteController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('order-items', OrderItemController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('order-events', OrderEventController::class);
    Route::apiResource('product-reviews', ProductReviewController::class);
    Route::apiResource('review-votes', ReviewVoteController::class);


    Route::get('/notifications-unread', [NotificationController::class, 'unreadCount']);


    // Notifications
    Route::resource('notifications', NotificationController::class);


    Route::get('notifications-unread', [NotificationController::class, 'unread']);
    Route::post('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);

    // Additional routes
    Route::post('/favorites/remove-by-user-product', [FavoriteController::class, 'removeByUserAndProduct']);



    //admin functions
    Route::prefix('admin')->middleware(AdminMiddleware::class)->group(function () {
        Route::get('/users', [AdminController::class, "showUsersBrief"]);
        // Route::get('/users/{id}/activity-log', [AdminController::class, 'getUserActivityLog']);
        Route::get("/users/{id}", [AdminController::class, "showUser"]);
        Route::post('/users', [AdminController::class, "createUser"]);
        Route::post('/roles', [AdminController::class, "createRole"]);
        Route::put('/roles/{id}', [AdminController::class, 'updateRole']);
        Route::put("/users/{id}", [AdminController::class, "updateUser"]);
        Route::delete('/users', [AdminController::class, 'destroyMultipleUsers']);
        Route::delete('/roles', [AdminController::class, 'destroyMultipleRoles']);
        Route::post("/reset-password/{id}", [AdminController::class, "resetUserPassword"]);
    });
});
