// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { eventsApi, Event } from '../services/apiClient';

export function useEvents(params?: { limit?: number; city?: string; type?: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [params?.city, params?.type]);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.list(params);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || '加载活动失败');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    events,
    loading,
    error,
    refresh: loadEvents,
  };
}

export function useEventDetail(id: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setEvent(null);
      return;
    }
    loadEvent(id);
  }, [id]);

  async function loadEvent(eventId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getDetail(eventId);
      setEvent(data);
    } catch (err: any) {
      setError(err?.message || '加载活动详情失败');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }

  async function apply(formData?: any) {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      await eventsApi.apply(id, formData);
      return true;
    } catch (err: any) {
      setError(err?.message || '报名失败');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    event,
    loading,
    error,
    apply,
    refresh: () => id && loadEvent(id),
  };
}
