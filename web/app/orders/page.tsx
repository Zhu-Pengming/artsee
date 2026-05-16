import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, ReceiptText, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/supabase/types";

const statusMeta: Record<string, { label: string; className: string; icon: typeof Clock3 }> = {
  pending: { label: "待支付", className: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock3 },
  checkout_created: { label: "待支付", className: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock3 },
  paid: { label: "已支付", className: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
  canceled: { label: "已取消", className: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
  expired: { label: "已过期", className: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
  failed: { label: "支付失败", className: "bg-red-50 text-red-700 border-red-100", icon: XCircle },
  refunded: { label: "已退款", className: "bg-blue-50 text-blue-700 border-blue-100", icon: ReceiptText },
};

function amountText(order: Pick<Order, "amount_total" | "currency">) {
  const amount = Number(order.amount_total || 0) / 100;
  const symbol = order.currency?.toLowerCase() === "cny" ? "¥" : `${order.currency?.toUpperCase()} `;
  return `${symbol}${amount.toFixed(2)}`;
}

function dateText(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/orders");

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = (data ?? []) as Order[];

  return (
    <div className="min-h-full bg-[#faf9f7] pb-6">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#eeece8] px-4 py-3 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 rounded-full bg-[#f0ede8] flex items-center justify-center">
          <ArrowLeft size={16} className="text-[#6b6b63]" />
        </Link>
        <div>
          <h1 className="text-[15px] font-bold text-[#1e1e1a]">我的订单</h1>
          <p className="text-[10px] text-[#8b8982]">课程、咨询与服务支付记录</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error.message}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="rounded-[22px] border border-[#eeece8] bg-white px-5 py-12 text-center">
            <ReceiptText size={34} className="mx-auto mb-3 text-[#c8c1b8]" />
            <p className="text-sm font-bold text-[#2c2018]">暂无订单</p>
            <p className="text-xs text-[#8b8982] mt-1">购买课程或咨询后会显示在这里。</p>
            <Link
              href="/learn"
              className="mt-5 inline-flex rounded-full bg-[#2c2018] px-5 py-2 text-xs font-bold text-white"
            >
              去课程中心
            </Link>
          </div>
        )}

        {orders.map((order) => {
          const meta = statusMeta[order.status] ?? statusMeta.pending;
          const Icon = meta.icon;
          return (
            <article key={order.id} className="rounded-[22px] border border-[#eeece8] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1e1e1a] line-clamp-2">{order.subject}</p>
                  <p className="mt-1 text-[10px] text-[#8b8982]">订单号 {order.order_no}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.className}`}>
                  <Icon size={12} />
                  {meta.label}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-[#9b9b93]">下单时间</p>
                  <p className="text-xs font-semibold text-[#6b6b63]">{dateText(order.created_at)}</p>
                </div>
                <p className="text-lg font-bold text-[#1A4B8C]">{amountText(order)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
