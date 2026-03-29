import { useState, useEffect, useRef } from 'react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  requestNotificationPermission,
  saveFCMToken,
  onForegroundMessage,
  type User
} from '@/lib/firebase';

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'post' | 'mention' | 'system';
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientIds?: string[];
  targetUrl?: string;
  read: boolean;
  ts: { seconds: number; nanoseconds: number };
  tsMs: number;
}

export function useNotifications(user: User | null) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const messageUnsubscribeRef = useRef<(() => void) | null>(null);

  // Request notification permission and get FCM token
  const requestPermission = async (): Promise<boolean> => {
    if (!user) return false;
    
    const token = await requestNotificationPermission();
    if (token) {
      setFcmToken(token);
      setPermissionStatus('granted');
      await saveFCMToken(user.uid, token);
      
      // Update user document with FCM token
      await setDoc(doc(db, 'users', user.uid), {
        fcmToken: token,
        notificationsEnabled: true
      }, { merge: true });
      
      return true;
    }
    setPermissionStatus(Notification.permission);
    return false;
  };

  // Check permission status on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Subscribe to notifications when user is logged in
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Query notifications for this user
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('tsMs', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs: NotificationPayload[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as NotificationPayload);
      });
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    unsubscribeRef.current = unsubscribe;

    // Listen to foreground messages
    const messageUnsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground notification received:', payload);
      // Play notification sound
      playNotificationSound();
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Nouvelle notification', {
          body: payload.notification?.body || '',
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: payload.data?.notificationId || 'default',
          data: payload.data
        });
      }
    });

    messageUnsubscribeRef.current = messageUnsubscribe;

    return () => {
      unsubscribe();
      if (messageUnsubscribe) messageUnsubscribe();
    };
  }, [user]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Autoplay blocked, ignore
      });
    } catch {
      // Audio not supported
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await setDoc(doc(db, 'notifications', notificationId), {
        read: true
      }, { merge: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    if (!user?.uid) return;
    
    try {
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', user.uid),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(unreadQuery);
      const promises = snapshot.docs.map(doc => 
        setDoc(doc.ref, { read: true }, { merge: true })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Send notification (for admins)
  const sendNotification = async ({
    title,
    body,
    type = 'general',
    recipientIds,
    targetUrl
  }: {
    title: string;
    body: string;
    type?: 'general' | 'post' | 'mention' | 'system';
    recipientIds?: string[];
    targetUrl?: string;
  }): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      const notificationData = {
        title,
        body,
        type,
        senderId: user.uid,
        senderName: `${user.prenom} ${user.nom}`,
        recipientIds: recipientIds || [],
        targetUrl,
        read: false,
        ts: serverTimestamp(),
        tsMs: Date.now()
      };

      // If specific recipients, create individual notifications
      if (recipientIds && recipientIds.length > 0) {
        const promises = recipientIds.map(recipientId =>
          addDoc(collection(db, 'notifications'), {
            ...notificationData,
            recipientId
          })
        );
        await Promise.all(promises);
      } else {
        // General notification - will be shown to all users
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          recipientId: 'all'
        });
      }

      // Store in notification_history for admin tracking
      await addDoc(collection(db, 'notification_history'), {
        ...notificationData,
        sentCount: recipientIds?.length || 0
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Get all users for notification targeting
  const getAllUsers = async (): Promise<{ uid: string; nom: string; prenom: string; email: string; departement?: string }[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          departement: data.departement
        };
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  };

  return {
    notifications,
    unreadCount,
    fcmToken,
    permissionStatus,
    requestPermission,
    markAsRead,
    markAllAsRead,
    sendNotification,
    getAllUsers,
    playNotificationSound
  };
}
