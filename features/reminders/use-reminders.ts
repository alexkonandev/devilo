"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  getRemindersAction,
  type ReminderItem,
  type ReminderType,
} from "@/actions/reminder-action";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useReminders() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getRemindersAction();
      if (result.success && result.data) {
        setReminders(result.data);
        setLastFetched(new Date());
      }
    } catch {
      // Silence les erreurs réseau
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling automatique
  useEffect(() => {
    fetchReminders();
    intervalRef.current = setInterval(fetchReminders, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchReminders]);

  const totalCount = reminders.length;

  const getCountByType = useCallback(
    (type: ReminderType): number => {
      return reminders.filter((r) => r.type === type).length;
    },
    [reminders],
  );

  return {
    reminders,
    totalCount,
    isLoading,
    lastFetched,
    refresh: fetchReminders,
    getCountByType,
  };
}