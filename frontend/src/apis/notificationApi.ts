import { api_path } from '~/constants/path'
import axiosClients from './axiosClients'
import { successResponse } from '~/types/utils.type'

export interface Notification {
  id: number
  title: string
  content: string
  is_seen: boolean
  created_at: string
}

type NotificationListResponse = successResponse<Notification[]>

type NotificationResponse = successResponse<Notification>

const url = api_path.notifications
const notificationApi = {
  getNotifications() {
    return axiosClients.get<NotificationListResponse>(url)
  },

  markAsRead(id: number) {
    return axiosClients.patch<NotificationResponse>(`${url}/${id}/`, {
      read: true
    })
  },

  markAllAsRead() {
    return axiosClients.post(`${url}/mark-all-read/`)
  },

  deleteNotification(id: number) {
    return axiosClients.delete(`${url}/${id}/`)
  },

  getUnreadCount() {
    return axiosClients.get<{ count: number }>(`${url}/unread-count/`)
  }
}

export default notificationApi
