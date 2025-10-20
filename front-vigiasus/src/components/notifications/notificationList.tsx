// src/components/notifications/notificationList.tsx
import { Notification } from "@/constants/notificationsData";
import NotificationItem from "@/components/notifications/notificationItem";

interface NotificationListProps {
  notifications: Notification[];
  activeNotificationId: number | null;
  onSelectNotification: (id: number) => void;
  readNotifications: Set<number>;
}

export default function NotificationList({
  notifications,
  activeNotificationId,
  onSelectNotification,
  readNotifications,
}: NotificationListProps) {
  return (
    // Container com scroll interno
    <div className="w-full h-full overflow-y-auto scrollbar-custom">
      <div className="flex flex-col gap-3 p-4"> {/* Padding original */}
        {notifications.map((notification) => {
          const isRead = readNotifications.has(notification.id);
          return (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isActive={notification.id === activeNotificationId}
              onClick={() => onSelectNotification(notification.id)}
              isRead={isRead}
            />
          );
        })}
      </div>
    </div>
  );
}