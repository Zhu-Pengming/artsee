"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function ArtlinkFab() {
  return (
    <Link
      href="/cases/new"
      className="fixed right-4 sm:right-8 bottom-28 sm:bottom-32 z-40 w-14 h-14 bg-al-cobalt text-al-shell rounded-full shadow-2xl shadow-al-cobalt/35 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      aria-label="发布案例"
    >
      <Plus size={28} strokeWidth={2.2} />
    </Link>
  );
}
