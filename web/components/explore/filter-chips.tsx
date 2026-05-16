"use client";

import { useState } from "react";

const filters = {
  degree: ["全部", "Master", "Bachelor", "PhD"],
  major: ["全部", "Fine Art", "Design", "Architecture", "Animation", "Photography", "Illustration"],
  ielts: ["全部", "6.0+", "6.5+", "7.0+", "7.5+"],
};

interface FilterChipsProps {
  onFilter: (degree: string, major: string, ielts: string) => void;
}

export function FilterChips({ onFilter }: FilterChipsProps) {
  const [activeDegree, setActiveDegree] = useState("全部");
  const [activeMajor, setActiveMajor] = useState("全部");
  const [activeIelts, setActiveIelts] = useState("全部");

  function update(degree: string, major: string, ielts: string) {
    onFilter(degree, major, ielts);
  }

  return (
    <div className="space-y-2 px-4 py-3 border-b border-[#eeece8]">
      {/* Row 1: Degree — solid primary when active */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.degree.map((d) => (
          <button key={d} onClick={() => { setActiveDegree(d); update(d, activeMajor, activeIelts); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              activeDegree === d
                ? "bg-[#2c2018] text-[#f2ece4] shadow-sm"
                : "bg-[#e8e4dc] text-[#6b6b63] hover:bg-[#dedad4]"
            }`}>{d}</button>
        ))}
      </div>
      {/* Row 2: Major — warm tint when active */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.major.map((m) => (
          <button key={m} onClick={() => { setActiveMajor(m); update(activeDegree, m, activeIelts); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              activeMajor === m
                ? "bg-[#f5ead8] text-[#8c6230] border border-[#d4a96a]/35"
                : "bg-white text-[#6b6b63] border border-[#e0ddd8] hover:border-[#c8c4be]"
            }`}>{m}</button>
        ))}
      </div>
      {/* Row 3: IELTS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.ielts.map((i) => (
          <button key={i} onClick={() => { setActiveIelts(i); update(activeDegree, activeMajor, i); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              activeIelts === i
                ? "bg-[#eef0eb] text-[#4a5c3e] border border-[#6b7c5e]/25"
                : "bg-white text-[#6b6b63] border border-[#e0ddd8] hover:border-[#c8c4be]"
            }`}>{i === "全部" ? "IELTS 全部" : `IELTS ${i}`}</button>
        ))}
      </div>
    </div>
  );
}
