import Link from "next/link";
import { XCircle } from "lucide-react";

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId } = await searchParams;

  return (
    <div className="min-h-full bg-[#faf9f7] px-4 py-10 flex items-center">
      <div className="w-full rounded-[28px] bg-white border border-[#eeece8] px-6 py-10 text-center shadow-sm">
        <XCircle size={52} className="mx-auto text-[#8c6230]" />
        <h1 className="mt-5 text-xl font-bold text-[#1e1e1a]">支付已取消</h1>
        <p className="mt-2 text-sm leading-6 text-[#6b6b63]">
          当前订单还没有完成支付，可以回到课程中心重新发起。
        </p>
        {orderId && (
          <p className="mt-4 break-all rounded-2xl bg-[#f7f4ef] px-3 py-2 text-[10px] text-[#8b8982]">
            Order {orderId}
          </p>
        )}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <Link href="/learn" className="inline-flex items-center justify-center rounded-full bg-[#2c2018] px-4 py-3 text-xs font-bold text-white">
            返回课程
          </Link>
          <Link href="/orders" className="inline-flex items-center justify-center rounded-full border border-[#d8d4ce] px-4 py-3 text-xs font-bold text-[#6b6b63]">
            查看订单
          </Link>
        </div>
      </div>
    </div>
  );
}
