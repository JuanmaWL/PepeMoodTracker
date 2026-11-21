import { useState, useEffect, useCallback, useRef } from 'react';
import { YearData } from '../types';
import { getLocalDateStr } from '../utils/date';
import SoundManager from '../utils/sounds';

export interface InAppNotification {
  title: string;
  body: string;
  tag: string;
}

interface UseNotificationsOptions {
  yearData: YearData;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function useNotifications({ yearData, triggerHaptic }: UseNotificationsOptions) {
  const [activeInAppNotification, setActiveInAppNotification] = useState<InAppNotification | null>(null);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pepe_notifications_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [nextScheduledInfo, setNextScheduledInfo] = useState<string>('No agendado');
  const testTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
    };
  }, []);

  const sendPepeNotification = useCallback((title: string, body: string, tag: string = 'pepe-mood-reminder') => {
    setActiveInAppNotification({ title, body, tag });
    SoundManager.play('magic', 0.12);

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions & { vibrate?: number[] } = {
      body,
      icon: 'https://sme2zz26xzjq57zw.public.blob.vercel-storage.com/favicon_2.png',
      badge: 'https://sme2zz26xzjq57zw.public.blob.vercel-storage.com/favicon_2.png',
      tag,
      requireInteraction: true,
      vibrate: [150, 50, 150],
      data: { url: window.location.origin + window.location.pathname }
    };

    try {
      new Notification(title, options);
    } catch {
      // Fallback handled by Service Worker below
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.showNotification(title, options).catch(() => {});
        } else {
          navigator.serviceWorker.ready
            .then(activeReg => activeReg.showNotification(title, options).catch(() => {}))
            .catch(() => {});
        }
      }).catch(() => {});

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'show-notification',
          title,
          options: {
            body,
            tag,
            vibrate: [150, 50, 150],
            requireInteraction: true,
            data: { url: window.location.origin + window.location.pathname }
          }
        });
      }
    }
  }, []);

  const scheduleDailyReminder = useCallback((dataToUse?: YearData) => {
    const activeData = dataToUse || yearData;
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      setNextScheduledInfo('Desactivado');
      return;
    }

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(23, 30, 0, 0);

    const todayStr = getLocalDateStr(now);
    const hasRegisteredToday = !!activeData[todayStr];
    const finalTargetDate = new Date(targetTime);
    let scheduleMsg = '';

    if (hasRegisteredToday) {
      finalTargetDate.setDate(finalTargetDate.getDate() + 1);
      scheduleMsg = 'Mañana a las 23:30 (Hoy registrado)';
    } else if (now.getTime() < targetTime.getTime()) {
      scheduleMsg = 'Hoy a las 23:30';
    } else {
      finalTargetDate.setDate(finalTargetDate.getDate() + 1);
      scheduleMsg = 'Mañana a las 23:30 (Hora de hoy vencida)';
    }

    setNextScheduledInfo(scheduleMsg);
    try {
      localStorage.setItem('pepe_next_reminder_time', finalTargetDate.getTime().toString());
    } catch {
      // Ignore storage error
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration) return;
        if (registration.getNotifications) {
          registration.getNotifications().then(notifications => {
            notifications.forEach(n => {
              if (n.tag === 'pepe-mood-reminder') n.close();
            });
          });
        }

        const options: any = {
          body: '¿Cómo te sientes hoy? No dejes el día en blanco en tu calendario de Pepe. Haz clic para puntuar.',
          icon: 'https://sme2zz26xzjq57zw.public.blob.vercel-storage.com/favicon_2.png',
          badge: 'https://sme2zz26xzjq57zw.public.blob.vercel-storage.com/favicon_2.png',
          tag: 'pepe-mood-reminder',
          requireInteraction: true,
          vibrate: [100, 50, 100],
          data: { url: window.location.origin + window.location.pathname }
        };

        if ('showTrigger' in Notification.prototype && (window as any).TimestampTrigger) {
          try {
            options.showTrigger = new (window as any).TimestampTrigger(finalTargetDate.getTime());
            registration.showNotification('🐸 Pepe Pixel Tracker', options);
          } catch {
            // showTrigger may be restricted
          }
        }
      }).catch(() => {});
    }
  }, [notificationsEnabled, yearData]);

  const toggleNotifications = useCallback(async () => {
    SoundManager.play('click');
    triggerHaptic('light');
    setNotificationFeedback(null);

    if (!('Notification' in window)) {
      setNotificationFeedback('Tu dispositivo o navegador no soporta notificaciones nativas.');
      return;
    }

    if (notificationsEnabled) {
      localStorage.setItem('pepe_notifications_enabled', 'false');
      setNotificationsEnabled(false);
      setNextScheduledInfo('Desactivado');

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg && reg.getNotifications) {
            reg.getNotifications().then(notifications => {
              notifications.forEach(n => {
                if (n.tag === 'pepe-mood-reminder') n.close();
              });
            });
          }
        });
      }
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        localStorage.setItem('pepe_notifications_enabled', 'true');
        setNotificationsEnabled(true);
        setNotificationFeedback('Recordatorio diario activado para las 23:30.');
        setTimeout(() => scheduleDailyReminder(), 300);
      } else if (permission === 'denied') {
        setNotificationFeedback('Permisos bloqueados. Habilítalos en los ajustes del navegador para recibir avisos.');
      }
    } catch {
      setNotificationFeedback('No se pudieron solicitar permisos de notificación en este entorno.');
    }
  }, [notificationsEnabled, triggerHaptic, scheduleDailyReminder]);

  const testLocalNotification = useCallback(() => {
    if (!('Notification' in window)) {
      setNotificationFeedback('Este navegador no soporta notificaciones nativas.');
      return;
    }

    if (Notification.permission !== 'granted') {
      setNotificationFeedback('Concede primero permisos activando el Recordatorio Diario arriba.');
      return;
    }

    SoundManager.play('click');
    triggerHaptic('light');
    setNotificationFeedback('Aviso de prueba programado: aparecerá en 5 segundos.');

    if (testTimerRef.current) clearTimeout(testTimerRef.current);
    testTimerRef.current = setTimeout(() => {
      sendPepeNotification(
        '🐸 ¡Éxito en la prueba de Pepe!',
        '¡Así de bien se verá tu recordatorio de las 23:30! Pulsa para registrar tu día en el pantano.',
        'pepe-test-reminder'
      );
    }, 5000);
  }, [triggerHaptic, sendPepeNotification]);

  useEffect(() => {
    if (!activeInAppNotification) return;
    const timer = setTimeout(() => setActiveInAppNotification(null), 7000);
    return () => clearTimeout(timer);
  }, [activeInAppNotification]);

  useEffect(() => {
    scheduleDailyReminder();
  }, [notificationsEnabled, yearData, scheduleDailyReminder]);

  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const savedTimeStr = localStorage.getItem('pepe_next_reminder_time');
      if (!savedTimeStr) return;
      const nextTime = parseInt(savedTimeStr, 10);
      if (Date.now() < nextTime) return;

      const todayStr = getLocalDateStr();
      const hasRegistered = !!yearData[todayStr];

      if (!hasRegistered && 'Notification' in window && Notification.permission === 'granted') {
        sendPepeNotification(
          '🐸 ¡Tu estado de ánimo de hoy!',
          '¿Cómo te ha ido el día? No olvides registrar tu humor diario en el calendario de Pepe.'
        );

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 30, 0, 0);
        localStorage.setItem('pepe_next_reminder_time', tomorrow.getTime().toString());
        setNextScheduledInfo('Mañana a las 23:30');
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, yearData, sendPepeNotification]);

  return {
    notificationsEnabled,
    notificationPermission,
    nextScheduledInfo,
    activeInAppNotification,
    notificationFeedback,
    dismissInAppNotification: useCallback(() => setActiveInAppNotification(null), []),
    clearNotificationFeedback: useCallback(() => setNotificationFeedback(null), []),
    sendPepeNotification,
    toggleNotifications,
    testLocalNotification
  };
}
