"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ListChecks,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

type AuditLog = {
  id: string;
  actor_user_id?: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  target_label?: string | null;
  request_ip?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: AuditLog[];
  count?: number;
  error?: string;
};

const ACTION_OPTIONS = [
  "",
  "refund.review",
  "payout_batch.process",
  "mentor_withdrawal.review",
  "reconciliation.import",
  "verification.review",
  "user.update",
];

const TARGET_OPTIONS = [
  "",
  "payment_refund_request",
  "payout_batch",
  "mentor_withdrawal_request",
  "payment_reconciliation_run",
  "verification",
  "user_profile",
];

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("artiqore_access_token") || localStorage.getItem("access_token") || "";
}

function compactId(id?: string | null) {
  if (!id) return "-";
  return id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

function dateText(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function metadataText(metadata?: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) return "-";
  return JSON.stringify(metadata);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok || body.error) {
    throw new Error(body.error || `请求失败 ${res.status}`);
  }
  return body as T;
}

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [count, setCount] = useState(0);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    if (!word) return rows;
    return rows.filter((row) => {
      return (
        row.action.toLowerCase().includes(word) ||
        row.target_type.toLowerCase().includes(word) ||
        (row.target_label ?? "").toLowerCase().includes(word) ||
        (row.target_id ?? "").toLowerCase().includes(word) ||
        (row.actor_user_id ?? "").toLowerCase().includes(word)
      );
    });
  }, [keyword, rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "80", offset: "0" });
      if (action) params.set("action", action);
      if (targetType) params.set("target_type", targetType);
      const body = await apiFetch<ApiListResponse>(`/api/v1/admin/audit-logs?${params.toString()}`);
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, targetType]);

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-5 text-[#1a1a1a] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-black/48 hover:text-[#003399]"
            >
              <ArrowLeft size={16} />
              运营后台
            </Link>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#003399]/8 text-[#003399]">
                <ListChecks size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">操作审计</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  查看管理员资金处理、用户变更、身份认证和对账导入等高风险操作。
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={load}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003399] px-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            刷新
          </button>
        </header>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            <AlertTriangle size={16} />
            {error}
          </div>
        ) : null}

        <section className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm md:grid-cols-[180px_220px_1fr]">
          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {option || "全部动作"}
              </option>
            ))}
          </select>
          <select
            value={targetType}
            onChange={(event) => setTargetType(event.target.value)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {TARGET_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {option || "全部对象"}
              </option>
            ))}
          </select>
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/34"
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="h-10 w-full rounded-lg border border-black/10 pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#003399]"
              placeholder="搜索 actor / target / action"
            />
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <h2 className="text-base font-black">日志列表</h2>
            <span className="text-xs font-bold text-black/40">
              {filteredRows.length} / {count}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">动作</th>
                  <th className="px-4 py-3">对象</th>
                  <th className="px-4 py-3">操作者</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">元数据</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-black/56">{dateText(row.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#003399]">
                      {row.action}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{row.target_label || row.target_type}</div>
                      <div className="mt-1 font-mono text-xs text-black/40">
                        {row.target_type} · {compactId(row.target_id)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-black/56">
                      {compactId(row.actor_user_id)}
                    </td>
                    <td className="px-4 py-3 text-black/56">{row.request_ip || "-"}</td>
                    <td className="max-w-[380px] truncate px-4 py-3 font-mono text-xs text-black/48">
                      {metadataText(row.metadata)}
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-bold text-black/36">
                      暂无审计日志
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
