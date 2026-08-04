import { useContext } from 'react';
import { NotificationContext, type NotificationContextValue } from '@/contexts/notification-context';

// hook to consume notification context
export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
export default useNotification;
