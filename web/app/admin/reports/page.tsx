"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquareWarning,
  RefreshCw,
  Search,
  ShieldAlert,
  TimerReset,
  XCircle,
} from "lucide-react";

type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
type ModerationAction = "none" | "hide_target" | "restrict_user";
type ReportPriority = "normal" | "high" | "critical";
type TargetType =
  | "user"
  | "event"
  | "opportunity"
  | "artwork"
  | "artist"
  | "post"
  | "comment"
  | "message"
  | "consultation"
  | "other";

type ContentReport = {
  id: string;
  reporter_user_id?: string | null;
  target_type: TargetType;
  target_id: string;
  reason: string;
  detail?: string | null;
  status: ReportStatus;
  priority?: ReportPriority | null;
  risk_score?: number | null;
  target_report_count?: number | null;
  reviewed_by_user_id?: string | null;
  reviewed_at?: string | null;
  resolution_note?: string | null;
  created_at?: string | null;
};

type ApiListResponse = {
  success: boolean;
  data: ContentReport[];
  count?: number;
  error?: string;
};

const STATUS_OPTIONS: Array<{ value: "all" | ReportStatus; label: string }> = [
  { value: "pending", label: "待处理" },
  { value: "reviewing", label: "处理中" },
  { value: "resolved", label: "已处理" },
  { value: "dismissed", label: "已关闭" },
  { value: "all", label: "全部" },
];

const TARGET_OPTIONS: Array<{ value: "all" | TargetType; label: string }> = [
  { value: "all", label: "全部对象" },
  { value: "user", label: "用户" },
  { value: "event", label: "活动" },
  { value: "opportunity", label: "机会" },
  { value: "artwork", label: "作品" },
  { value: "artist", label: "艺术家" },
  { value: "post", label: "帖子" },
  { value: "comment", label: "评论" },
  { value: "message", label: "消息" },
  { value: "consultation", label: "咨询" },
  { value: "other", label: "其他" },
];

const PRIORITY_OPTIONS: Array<{ value: "all" | ReportPriority; label: string }> = [
  { value: "all", label: "全部优先级" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
];

const STATUS_META: Record<ReportStatus, { label: string; className: string }> = {
  pending: {
    label: "待处理",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  reviewing: {
    label: "处理中",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  resolved: {
    label: "已处理",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  dismissed: {
    label: "已关闭",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
};

const PRIORITY_META: Record<ReportPriority, { label: string; className: string }> = {
  normal: {
    label: "Normal",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  },
  high: {
    label: "High",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  critical: {
    label: "Critical",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

const REASON_LABELS: Record<string, string> = {
  spam: "垃圾信息",
  scam: "诈骗/诱导",
  harassment: "骚扰攻击",
  copyright: "版权问题",
  false_info: "虚假信息",
  inappropriate: "不当内容",
  privacy: "隐私泄露",
  other: "其他",
};

const MODERATION_ACTION_OPTIONS: Array<{ value: ModerationAction; label: string }> = [
  { value: "none", label: "仅更新举报状态" },
  { value: "hide_target", label: "隐藏/归档被举报内容" },
  { value: "restrict_user", label: "限制被举报用户" },
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-black/44">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#003399]">{value}</p>
    </div>
  );
}

export default function AdminReportsPage() {
  const [rows, setRows] = useState<ContentReport[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<"all" | ReportStatus>("pending");
  const [priority, setPriority] = useState<"all" | ReportPriority>("all");
  const [targetType, setTargetType] = useState<"all" | TargetType>("all");
  const [keyword, setKeyword] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [moderationAction, setModerationAction] = useState<ModerationAction>("none");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    const word = keyword.trim().toLowerCase();
    if (!word) return rows;
    return rows.filter((row) => {
      return (
        row.id.toLowerCase().includes(word) ||
        row.target_id.toLowerCase().includes(word) ||
        row.target_type.toLowerCase().includes(word) ||
        row.reason.toLowerCase().includes(word) ||
        (row.detail ?? "").toLowerCase().includes(word)
      );
    });
  }, [keyword, rows]);

  const metrics = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        const reportPriority = row.priority ?? "normal";
        acc[reportPriority] = (acc[reportPriority] ?? 0) + 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        reviewing: 0,
        resolved: 0,
        dismissed: 0,
        normal: 0,
        high: 0,
        critical: 0,
      } as Record<
        ReportStatus | ReportPriority | "total",
        number
      >
    );
  }, [rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "80", offset: "0" });
      if (status !== "all") params.set("status", status);
      if (priority !== "all") params.set("priority", priority);
      if (targetType !== "all") params.set("target_type", targetType);
      const body = await apiFetch<ApiListResponse>(`/api/v1/admin/reports?${params.toString()}`);
      setRows(body.data ?? []);
      setCount(body.count ?? body.data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function review(row: ContentReport, nextStatus: ReportStatus) {
    setActingId(`${row.id}:${nextStatus}`);
    setError("");
    try {
      await apiFetch(`/api/v1/admin/reports/${row.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          status: nextStatus,
          resolution_note: resolutionNote.trim() || undefined,
          moderation_action: nextStatus === "resolved" ? moderationAction : "none",
        }),
      });
      setResolutionNote("");
      setModerationAction("none");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingId("");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority, targetType]);

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
                <MessageSquareWarning size={20} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-normal">举报中心</h1>
                <p className="mt-1 text-sm font-medium text-black/52">
                  集中处理用户举报，标记处理中、已处理或关闭，并保留审计记录。
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

        <section className="grid gap-3 md:grid-cols-5">
          <Metric label="当前列表" value={`${metrics.total}`} />
          <Metric label="待处理" value={`${metrics.pending}`} />
          <Metric label="处理中" value={`${metrics.reviewing}`} />
          <Metric label="高优先级" value={`${metrics.high}`} />
          <Metric label="严重" value={`${metrics.critical}`} />
        </section>

        <section className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm lg:grid-cols-[160px_180px_180px_1fr]">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | ReportStatus)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as "all" | ReportPriority)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={targetType}
            onChange={(event) => setTargetType(event.target.value as "all" | TargetType)}
            className="h-10 rounded-lg border border-black/10 px-3 text-sm font-bold outline-none focus:border-[#003399]"
          >
            {TARGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
              placeholder="搜索举报 ID、对象 ID、原因或说明"
            />
          </label>
        </section>

        <section className="grid gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm lg:grid-cols-[1fr_260px]">
          <label className="grid gap-1 text-sm font-bold text-black/70">
            处理备注
            <input
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
              className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#003399]"
              placeholder="会随状态更新通知举报人"
            />
          </label>
          <label className="grid gap-1 text-sm font-bold text-black/70">
            处置动作
            <select
              value={moderationAction}
              onChange={(event) => setModerationAction(event.target.value as ModerationAction)}
              className="h-10 rounded-lg border border-black/10 px-3 text-sm font-semibold outline-none focus:border-[#003399]"
            >
              {MODERATION_ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <h2 className="text-base font-black">举报列表</h2>
            <span className="text-xs font-bold text-black/40">
              {filteredRows.length} / {count}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-sm">
              <thead className="bg-black/[0.03] text-xs font-black text-black/48">
                <tr>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">优先级</th>
                  <th className="px-4 py-3">举报对象</th>
                  <th className="px-4 py-3">原因</th>
                  <th className="px-4 py-3">说明</th>
                  <th className="px-4 py-3">举报人</th>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {filteredRows.map((row) => {
                  const meta = STATUS_META[row.status];
                  const priorityMeta = PRIORITY_META[row.priority ?? "normal"];
                  return (
                    <tr key={row.id}>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${priorityMeta.className}`}>
                          {priorityMeta.label}
                        </span>
                        <div className="mt-1 text-xs font-bold text-black/36">
                          {row.risk_score ?? 0} 分 / {row.target_report_count ?? 1} 次
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold">{row.target_type}</div>
                        <div className="mt-1 font-mono text-xs text-black/42">{compactId(row.target_id)}</div>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {REASON_LABELS[row.reason] ?? row.reason}
                      </td>
                      <td className="max-w-[280px] px-4 py-3 text-black/56">
                        <div className="line-clamp-2">{row.detail || "-"}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-black/48">
                        {compactId(row.reporter_user_id)}
                      </td>
                      <td className="px-4 py-3 text-black/56">{dateText(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {row.status === "pending" ? (
                            <ActionButton
                              icon={<TimerReset size={14} />}
                              loading={actingId === `${row.id}:reviewing`}
                              onClick={() => review(row, "reviewing")}
                            >
                              处理中
                            </ActionButton>
                          ) : null}
                          {["pending", "reviewing"].includes(row.status) ? (
                            <>
                              <ActionButton
                                icon={<CheckCircle2 size={14} />}
                                loading={actingId === `${row.id}:resolved`}
                                onClick={() => review(row, "resolved")}
                              >
                                已处理
                              </ActionButton>
                              <ActionButton
                                icon={<XCircle size={14} />}
                                loading={actingId === `${row.id}:dismissed`}
                                onClick={() => review(row, "dismissed")}
                              >
                                关闭
                              </ActionButton>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm font-bold text-black/36">
                      暂无举报
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

function ActionButton({
  children,
  icon,
  loading,
  onClick,
}: {
  children: string;
  icon: ReactNode;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-xs font-bold text-black/62 hover:border-[#003399]/30 hover:text-[#003399] disabled:opacity-50"
      disabled={loading}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
