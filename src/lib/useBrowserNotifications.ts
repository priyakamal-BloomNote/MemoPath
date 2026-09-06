import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

const STORAGE_KEY = 'memo-path-browser-notifications-enabled';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

function getStoredPref(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

function setStoredPref(v: boolean) {
  try { localStorage.setItem(STORAGE_KEY, v ? 'true' : 'false'); } catch { /* ignore */ }
}

export function useBrowserNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotificationPermissionState);
    setEnabled(getStoredPref());
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    return result === 'granted';
  }, []);

  const enable = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setEnabled(true);
      setStoredPref(true);
      if (user) {
        await supabase.from('profiles').update({ browser_notifications: true }).eq('user_id', user.id);
      }
      new Notification('Memo Path notifications enabled', { body: 'You\'ll now receive desktop notifications for your moments, goals, and reflections.', icon: '/images/image.png' });
      return true;
    }
    return false;
  }, [requestPermission, user]);

  const disable = useCallback(async () => {
    setEnabled(false);
    setStoredPref(false);
    if (user) {
      await supabase.from('profiles').update({ browser_notifications: false }).eq('user_id', user.id);
    }
  }, [user]);

  const notify = useCallback((title: string, body: string) => {
    if (!enabled || permission !== 'granted') return;
    try {
      new Notification(title, { body, icon: '/images/image.png' });
    } catch { /* ignore */ }
  }, [enabled, permission]);

  useEffect(() => {
    if (!user || !enabled || permission !== 'granted') return;
    const channel = supabase
      .channel('browser-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as { title: string; message: string };
        notify(n.title, n.message);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, enabled, permission, notify]);

  return { permission, enabled, enable, disable, requestPermission };
}
