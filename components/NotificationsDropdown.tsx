import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  link?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'New employee onboarding',
    isRead: false,
    link: '/employees/onboarding'
  },
  {
    id: '2',
    message: 'Payroll processing complete',
    isRead: false,
    link: '/payroll'
  },
  {
    id: '3',
    message: 'Performance review due',
    isRead: true,
    link: '/employees/reviews'
  }
];

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link || '#'}
                    className={`block p-3 rounded hover:bg-gray-50 ${
                      notification.isRead ? 'text-gray-500' : 'font-semibold text-gray-900'
                    }`}
                  >
                    {notification.message}
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No new notifications</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t">
              <Link
                href="/settings/notifications"
                className="block text-center text-sm text-blue-500 hover:text-blue-600"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
