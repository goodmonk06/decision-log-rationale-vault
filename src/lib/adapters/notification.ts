export interface NotificationPayload {
  title: string
  message: string
  decisionId?: string
  userId?: string
  metadata?: Record<string, any>
}

export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>
  sendBatch(payloads: NotificationPayload[]): Promise<void>
}

// Stub implementation
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log('NOTIFICATION:', JSON.stringify(payload, null, 2))
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    console.log('BATCH NOTIFICATIONS:', JSON.stringify(payloads, null, 2))
  }
}

// Export singleton instance
export const notificationAdapter: INotificationAdapter = new ConsoleNotificationAdapter()
