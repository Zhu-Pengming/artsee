// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { ordersApi } from '../services/apiClient';

export function useOrders(params?: { limit?: number; offset?: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getMyOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || '加载订单失败');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    orders,
    loading,
    error,
    refresh: loadOrders,
  };
}
