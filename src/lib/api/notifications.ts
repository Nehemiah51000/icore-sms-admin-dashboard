import { api } from '../api';

export interface NotificationItem {
  id: string;
  type: string;
  data: { message: string; [key: string]: unknown };
  read_at: string | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export function getNotifications() {
  return api.get<PaginatedResponse<NotificationItem>>('/admin/notifications');
}

export function getUnreadCount() {
  return api.get<{ count: number }>('/admin/notifications/unread-count');
}

export function markAsRead(id: string) {
  return api.put<{ message: string }>(`/admin/notifications/${id}/read`, {});
}

export function markAllAsRead() {
  return api.put<{ message: string }>('/admin/notifications/read-all', {});
}
