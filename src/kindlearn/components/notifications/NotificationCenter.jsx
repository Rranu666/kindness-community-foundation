import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '@/kindlearn/api/notifications';
import { Bell, X, Trophy, Target, Star, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeIcons = {
  milestone: Trophy,
  achievement: Star,
  task: Target,
  update: Info,
};

const typeBg = {
  milestone: 'bg-amber-50 border-amber-200',
  achievement: 'bg-emerald-50 border-emerald-200',
  task: 'bg-primary/10 border-primary/30',
  update: 'bg-blue-50 border-blue-200',
};

export default function NotificationCenter({ langId }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Skip all API calls for guests — no token means no notifications
    if (!localStorage.getItem('kl_token')) return;

    loadNotifications();

    // Subscribe to new notifications
    const unsubscribe = notificationsApi.subscribe((event) => {
      if (event.type === 'create') {
        setNotifications(prev => [event.data, ...prev]);
        setUnreadCount(prev => prev + 1);
      } else if (event.type === 'update') {
        setNotifications(prev =>
          prev.map(n => n.id === event.id ? event.data : n)
        );
      }
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await notificationsApi.filter(
        { dismissed: false },
        '-created_date',
        50
      );
      setNotifications(list);
      const unread = list.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch {
      // API unavailable or user not authenticated — silently show empty state
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationsApi.update(notification.id, { read: true });
    } catch { /* ignore */ }
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDismiss = async (notification) => {
    try {
      await notificationsApi.update(notification.id, { dismissed: true });
    } catch { /* ignore */ }
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-16px)] bg-card rounded-2xl border shadow-xl z-40"
            >
              {/* Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => {
                      const Icon = typeIcons[notif.type] || Info;
                      return (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={`p-4 border-l-4 ${typeBg[notif.type]} cursor-pointer hover:opacity-75 transition-opacity`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 text-xl">{notif.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm flex items-center gap-2">
                                {notif.title}
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                              <p className="text-xs text-muted-foreground/60 mt-2">
                                {new Date(notif.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismiss(notif);
                              }}
                              className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
                              aria-label="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}