import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  MessageSquare, 
  Users, 
  Info,
  CheckCheck
} from 'lucide-react';
import type { NotificationPayload } from '@/hooks/useNotifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationPayload[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'post':
      return <MessageSquare className="w-4 h-4" />;
    case 'mention':
      return <Users className="w-4 h-4" />;
    case 'system':
      return <Info className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'post':
      return 'from-violet-500 to-purple-500';
    case 'mention':
      return 'from-cyan-500 to-blue-500';
    case 'system':
      return 'from-amber-500 to-orange-500';
    default:
      return 'from-violet-500 to-cyan-500';
  }
};

export function NotificationPanel({ 
  isOpen, 
  onClose, 
  notifications, 
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTime = (tsMs: number) => {
    const date = new Date(tsMs);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-hidden"
            style={{ 
              background: 'linear-gradient(180deg, #1a1a25 0%, #151520 100%)',
              borderLeft: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                  }}
                >
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Notifications</h2>
                  <p className="text-sm text-gray-400">
                    {unreadCount > 0 
                      ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` 
                      : 'Tout est à jour'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={onMarkAllAsRead}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="w-5 h-5" />
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center px-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                    style={{ 
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <Bell className="w-10 h-10 text-gray-500" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-white mb-2">Pas de notifications</h3>
                  <p className="text-sm text-gray-400">
                    Vous recevrez ici les notifications importantes de votre entreprise
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-violet-500/5' : ''
                      }`}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getNotificationColor(notification.type)}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(notification.tsMs)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Par {notification.senderName}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
