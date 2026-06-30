"use client";

import { Search } from "lucide-react";
import { House } from "@/app/types/house";

interface Props {
  keyword: string;
  setKeyword: (v: string) => void;
  houses: House[];
  onSelect: (house: House) => void;
}

export default function SearchControl({
  keyword,
  setKeyword,
  houses,
  onSelect,
}: Props) {
  const result =
    keyword.length === 0
      ? []
      : houses.filter(
          (h) =>
            h.no_rumah.toLowerCase().includes(keyword.toLowerCase()) ||
            h.warga?.nama.toLowerCase().includes(keyword.toLowerCase()),
        );

  return (
    <div className="relative w-full lg:w-96">
      <Search size={18} className="absolute left-4 top-4 text-gray-400" />

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Cari rumah..."
        className="w-full h-12 rounded-xl border pl-11 pr-4 bg-white shadow"
      />

      {result.length > 0 && (
        <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border overflow-hidden">
          {result.map((house) => (
            <button
              key={house.id}
              onClick={() => {
                onSelect(house);
                setKeyword("");
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-100"
            >
              <div className="font-semibold">{house.no_rumah}</div>

              <div className="text-sm text-gray-500">
                {house.warga?.nama || "Belum dihuni"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
