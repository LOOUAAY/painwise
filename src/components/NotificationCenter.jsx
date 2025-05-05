import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationCenter = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`/api/notifications.php?user_id=${userId}`);
            const data = await response.json();
            if (data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification_id: notificationId }),
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(notifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                ));
            }
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${
                                notification.is_read
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">{notification.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter; 