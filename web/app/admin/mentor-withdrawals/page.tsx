"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  WalletCards,
  XCircle,
} from "lucide-react";

type WithdrawalStatus = "requested" | "approved" | "rejected" | "paid" | "canceled";

type Withdrawal = {
  id: string;
  mentor_id: string;
  requested_by_user_id: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  review_note?: string | null;
  requested_at?: string | null;
  reviewed_at?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: Withdrawal[];
  count?: number;
  error?: string;
};

const STATUS_OPTIONS: Array<{ value: "all" | WithdrawalStatus; label: string }> = [
  { value: "all", label: "全部" },
  { value: "requested", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "paid", label: "已打款" },
  { value: "rejected", label: "未通过" },
  { value: "canceled", label: "已取消" },
];

const STATUS_META: Record<WithdrawalStatus, { label: string; className: string }> = {
  requested: {
    label: "待审核",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  approved: {
    label: "已通过",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  paid: {
    label: "已打款",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
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

function compactId(id: string) {
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

export default function AdminMentorWithdrawalsPage() {
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<"all" | WithdrawalStatus>("requested");
  const [mentorId, setMentorId] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");

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
        paid: 0,
        rejected: 0,
        canceled: 0,
      } as Record<WithdrawalStatus | "total", number>
    );
  }, [rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "50", offset: "0" });
      if (status !== "all") params.set("status", status);
      if (mentorId.trim()) params.set("mentor_id", mentorId.trim());
      const body = await apiFetch<ApiListResponse>(
        `/api/v1/admin/mentor-withdrawals?${params.toString()}`
      );
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function review(row: Withdrawal, nextStatus: WithdrawalStatus) {
    setActingId(`${row.id}:${nextStatus}`);
    setError("");
    try {
      await apiFetch(`/api/v1/admin/mentor-withdrawals/${row.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          status: nextStatus,
          review_note: reviewNote.trim() || undefined,
        }),
      });
      await load();
      setReviewNote("");
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
                <WalletCards size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">导师提现审核</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  查看提现申请，审核通过或标记已打款。所有操作会写入提现状态并通知导师。
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
          <Metric label="已通过" value={price(totals.approved)} />
          <Metric label="已打款" value={price(totals.paid)} />
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            <div className="flex flex-col gap-2 md:flex-row">
              <label className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/34"
                />
                <input
                  value={mentorId}
                  onChange={(event) => setMentorId(event.target.value)}
                  placeholder="按 mentor_id 筛选"
                  className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f5ef] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#003399]/40 md:w-72"
                />
              </label>
              <button
                onClick={load}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-bold text-black/68 hover:border-[#003399]/30 hover:text-[#003399]"
              >
                <Search size={15} />
                查询
              </button>
            </div>
          </div>
          <div className="mt-3">
            <textarea
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="审核备注，可选。会随审核结果通知导师。"
              className="min-h-20 w-full resize-y rounded-lg border border-black/10 bg-[#f7f5ef] px-3 py-2 text-sm font-medium outline-none focus:border-[#003399]/40"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <p className="text-sm font-black">提现申请</p>
            <p className="text-xs font-bold text-black/42">共 {count} 条</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f5ef] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">申请 ID</th>
                  <th className="px-4 py-3">导师</th>
                  <th className="px-4 py-3">金额</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">申请时间</th>
                  <th className="px-4 py-3">最近处理</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      <Loader2 size={18} className="mx-auto mb-2 animate-spin text-[#003399]" />
                      正在加载提现申请
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm font-bold text-black/46">
                      当前筛选下暂无提现申请
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-black/6 align-middle">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-black/60">
                        {compactId(row.id)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-black/70">
                          {compactId(row.mentor_id)}
                        </div>
                        <div className="mt-1 font-mono text-[11px] font-semibold text-black/36">
                          user {compactId(row.requested_by_user_id)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-base font-black">{price(row.amount, row.currency)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-black/54">
                        {dateText(row.requested_at ?? row.created_at)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-black/54">
                        {dateText(row.paid_at ?? row.reviewed_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            label="通过"
                            icon={<CheckCircle2 size={14} />}
                            disabled={row.status === "paid" || row.status === "approved"}
                            loading={actingId === `${row.id}:approved`}
                            onClick={() => review(row, "approved")}
                          />
                          <ActionButton
                            label="打款"
                            icon={<Send size={14} />}
                            disabled={row.status === "paid" || row.status === "rejected" || row.status === "canceled"}
                            loading={actingId === `${row.id}:paid`}
                            onClick={() => review(row, "paid")}
                          />
                          <ActionButton
                            label="拒绝"
                            icon={<XCircle size={14} />}
                            danger
                            disabled={row.status === "paid" || row.status === "rejected"}
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

function StatusBadge({ status }: { status: WithdrawalStatus }) {
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
