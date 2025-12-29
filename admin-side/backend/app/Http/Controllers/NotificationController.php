<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Http\Requests\StoreNotificationRequest;
use App\Http\Requests\UpdateNotificationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $notifications = Notification::latest()->paginate(10);
        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }



    /**
     * Get unread notifications
     */
    public function unread(): JsonResponse
    {
        $notifications = Notification::where('read', false)
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
            'count' => $notifications->count()
        ]);

    }





    /**
     * Get notification count
     */
    public function unreadCount(): JsonResponse
    {
        $count = Notification::where('read', false)->count();

        return response()->json([
            'status' => 'success',
            'count' => $count
        ]);
    }




    /**
     * Mark notification as read
     */
    public function markAsRead($id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read',
            'data' => $notification
        ]);
    }




    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        Notification::where('read', false)->update(['read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read'
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
    public function store(StoreNotificationRequest $request): JsonResponse
    {
        $notification = Notification::create($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Notification created successfully',
            'data' => $notification
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Notification $notification): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $notification
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Notification $notification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNotificationRequest $request, Notification $notification): JsonResponse
    {
        $notification->update($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Notification updated successfully',
            'data' => $notification
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Notification deleted successfully'
        ]);
    }
}
