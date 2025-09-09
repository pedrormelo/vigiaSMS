import { Notification } from "@/constants/notificationsData";
import NotificationItem from "@/components/notifications/notificationItem";

interface NotificationListProps {
  notifications: Notification[];
  activeNotificationId: number | null;
  onSelectNotification: (id: number) => void;
}

export default function NotificationList({
  notifications,
  activeNotificationId,
  onSelectNotification,
}: NotificationListProps) {
  return (
    <div className="w-96 p-4 rounded-xl shadow-lg border border-gray-200 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">Notificações</h2>
      <div className="flex flex-col gap-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isActive={notification.id === activeNotificationId}
            onClick={() => onSelectNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}