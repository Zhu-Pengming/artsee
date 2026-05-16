import type { Case } from "@/lib/supabase/types";
import { CaseCard } from "./case-card";

export function WaterfallGrid({ items }: { items: Case[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {items.map((item, index) => (
        <CaseCard key={item.id} c={item} tall={index % 3 === 1} />
      ))}
    </div>
  );
}
