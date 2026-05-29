// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, nickname: string) => Promise<void>;
  onDevLogin: () => Promise<void>;
}

export function AuthDialog({ isOpen, onClose, onLogin, onSignup, onDevLogin }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onSignup(email, password, nickname);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin() {
    setError('');
    setLoading(true);

    try {
      await onDevLogin();
      onClose();
    } catch (err: any) {
      setError(err?.message || '开发者登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-ink mb-6">
          {mode === 'login' ? '登录' : '注册'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border border-silver/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cobalt/50"
                placeholder="输入昵称"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-silver/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cobalt/50"
              placeholder="输入邮箱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-silver/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cobalt/50"
              placeholder="输入密码"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-cobalt text-white py-3 rounded-xl font-medium transition-all",
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-cobalt/90 active:scale-[0.98]"
            )}
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-sm text-cobalt hover:underline"
          >
            {mode === 'login' ? '还没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-silver/30">
          <button
            onClick={handleDevLogin}
            disabled={loading}
            className="w-full bg-gray-100 text-ink/70 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            开发者快速登录
          </button>
        </div>
      </div>
    </div>
  );
}
