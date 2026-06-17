"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  TimerReset,
  XCircle,
} from "lucide-react";

type RefundStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

type RefundRequest = {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  reason?: string | null;
  status: RefundStatus;
  provider?: string | null;
  provider_refund_id?: string | null;
  review_note?: string | null;
  requested_at?: string | null;
  reviewed_at?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: RefundRequest[];
  count?: number;
  error?: string;
};

const STATUS_OPTIONS: Array<{ value: "all" | RefundStatus; label: string }> = [
  { value: "requested", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "processing", label: "处理中" },
  { value: "succeeded", label: "已退款" },
  { value: "failed", label: "退款失败" },
  { value: "rejected", label: "未通过" },
  { value: "all", label: "全部" },
];

const STATUS_META: Record<RefundStatus, { label: string; className: string }> = {
  requested: {
    label: "待审核",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  approved: {
    label: "已通过",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  processing: {
    label: "处理中",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  succeeded: {
    label: "已退款",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  failed: {
    label: "退款失败",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  rejected: {
    label: "未通过",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  canceled: {
    label: "已取消",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("artiqore_access_token") || localStorage.getItem("access_token") || "";
}

function price(amount: number, currency = "cny") {
  const symbol = currency.toLowerCase() === "cny" ? "¥" : `${currency.toUpperCase()} `;
  return `${symbol}${(amount / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function compactId(id?: string | null) {
  if (!id) return "-";
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
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

export default function AdminRefundsPage() {
  const [rows, setRows] = useState<RefundRequest[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<"all" | RefundStatus>("requested");
  const [keyword, setKeyword] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [providerRefundId, setProviderRefundId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    if (!word) return rows;
    return rows.filter((row) => {
      return (
        row.id.toLowerCase().includes(word) ||
        row.order_id.toLowerCase().includes(word) ||
        row.user_id.toLowerCase().includes(word) ||
        (row.reason ?? "").toLowerCase().includes(word)
      );
    });
  }, [keyword, rows]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += row.amount;
        acc[row.status] = (acc[row.status] ?? 0) + row.amount;
        return acc;
      },
      {
        total: 0,
        requested: 0,
        approved: 0,
        processing: 0,
        succeeded: 0,
        failed: 0,
        rejected: 0,
        canceled: 0,
      } as Record<RefundStatus | "total", number>
    );
  }, [rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "80", offset: "0" });
      if (status !== "all") params.set("status", status);
      const body = await apiFetch<ApiListResponse>(`/api/v1/admin/refunds?${params.toString()}`);
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function review(row: RefundRequest, nextStatus: RefundStatus) {
    setActingId(`${row.id}:${nextStatus}`);
    setError("");
    try {
      await apiFetch(`/api/v1/admin/refunds/${row.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          status: nextStatus,
          review_note: reviewNote.trim() || undefined,
          provider_refund_id: providerRefundId.trim() || undefined,
        }),
      });
      await load();
      setReviewNote("");
      setProviderRefundId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingId("");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
                <RotateCcw size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">退款申请</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  审核订单退款申请，跟踪 provider 退款号，并在退款成功后同步订单和收益状态。
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
            <ShieldAlert size={16} />
            {error}
          </div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="当前列表金额" value={price(totals.total)} />
          <Metric label="待审核" value={price(totals.requested)} />
          <Metric label="处理中" value={price(totals.processing)} />
          <Metric label="已退款" value={price(totals.succeeded)} />
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className={`h-9 rounded-lg px-3 text-sm font-bold ring-1 transition ${
                  status === option.value
                    ? "bg-[#003399] text-white ring-[#003399]"
                    : "bg-white text-black/58 ring-black/10 hover:text-[#003399]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-[300px_1fr_260px]">
            <label className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/34"
              />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索退款、订单、用户 ID 或原因"
                className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#003399]/40"
              />
            </label>
            <textarea
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="审核备注，可选。会随退款状态通知用户。"
              className="min-h-10 w-full resize-y rounded-lg border border-black/10 bg-[#f7f5ef] px-3 py-2 text-sm font-medium outline-none focus:border-[#003399]/40"
            />
            <input
              value={providerRefundId}
              onChange={(event) => setProviderRefundId(event.target.value)}
              placeholder="provider_refund_id，可选"
              className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] px-3 text-sm font-semibold outline-none focus:border-[#003399]/40"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <p className="text-sm font-black">退款申请</p>
            <p className="text-xs font-bold text-black/42">
              API 共 {count} 条，当前显示 {filteredRows.length} 条
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f5ef] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">退款</th>
                  <th className="px-4 py-3">订单</th>
                  <th className="px-4 py-3">用户</th>
                  <th className="px-4 py-3">金额</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      <Loader2 size={18} className="mx-auto mb-2 animate-spin text-[#003399]" />
                      正在加载退款申请
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      当前筛选下暂无退款申请
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="border-t border-black/6 align-middle">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-black/68">{compactId(row.id)}</div>
                        <div className="mt-1 max-w-[260px] truncate text-xs font-semibold text-black/42">
                          {row.reason || row.provider_refund_id || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-black/54">
                        {compactId(row.order_id)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-black/54">
                        {compactId(row.user_id)}
                      </td>
                      <td className="px-4 py-3 font-black text-[#003399]">
                        {price(row.amount, row.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-black/54">
                        <div>申请 {dateText(row.requested_at ?? row.created_at)}</div>
                        <div>处理 {dateText(row.processed_at ?? row.reviewed_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            label="通过"
                            icon={<CheckCircle2 size={14} />}
                            disabled={row.status !== "requested"}
                            loading={actingId === `${row.id}:approved`}
                            onClick={() => review(row, "approved")}
                          />
                          <ActionButton
                            label="发起"
                            icon={<TimerReset size={14} />}
                            disabled={!["requested", "approved", "failed"].includes(row.status)}
                            loading={actingId === `${row.id}:processing`}
                            onClick={() => review(row, "processing")}
                          />
                          <ActionButton
                            label="成功"
                            icon={<CheckCircle2 size={14} />}
                            disabled={!["requested", "approved", "processing"].includes(row.status)}
                            loading={actingId === `${row.id}:succeeded`}
                            onClick={() => review(row, "succeeded")}
                          />
                          <ActionButton
                            label="拒绝"
                            icon={<XCircle size={14} />}
                            danger
                            disabled={row.status !== "requested"}
                            loading={actingId === `${row.id}:rejected`}
                            onClick={() => review(row, "rejected")}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black text-black/38">{label}</p>
      <p className="mt-2 text-xl font-black text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RefundStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.requested;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  loading,
  danger,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300"
          : "border-black/10 bg-white text-black/68 hover:border-[#003399]/30 hover:text-[#003399]"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
