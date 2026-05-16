import Link from "next/link";
import { CheckCircle2, ReceiptText } from "lucide-react";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="min-h-full bg-[#faf9f7] px-4 py-10 flex items-center">
      <div className="w-full rounded-[28px] bg-white border border-[#eeece8] px-6 py-10 text-center shadow-sm">
        <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
        <h1 className="mt-5 text-xl font-bold text-[#1e1e1a]">支付已提交</h1>
        <p className="mt-2 text-sm leading-6 text-[#6b6b63]">
          Stripe 已接收支付结果。订单状态会通过 webhook 回写到支付中心。
        </p>
        {sessionId && (
          <p className="mt-4 break-all rounded-2xl bg-[#f7f4ef] px-3 py-2 text-[10px] text-[#8b8982]">
            Session {sessionId}
          </p>
        )}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <Link href="/orders" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2c2018] px-4 py-3 text-xs font-bold text-white">
            <ReceiptText size={14} />
            查看订单
          </Link>
          <Link href="/learn" className="inline-flex items-center justify-center rounded-full border border-[#d8d4ce] px-4 py-3 text-xs font-bold text-[#6b6b63]">
            返回课程
          </Link>
        </div>
      </div>
    </div>
  );
}
