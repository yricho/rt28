"use client";

import { X } from "lucide-react";

import { House } from "@/app/types/house";

import HouseCard from "./HouseCard";

interface Props {
  house: House | null;
  onClose: () => void;
}

export default function HouseDrawer({ house, onClose }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/40 z-[1998]
          transition
          ${house ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      <div
        className={`
          fixed
          top-0
          right-0
          h-screen
          w-full
          sm:w-[420px]
          bg-white
          z-[1999]
          shadow-2xl
          transition-transform
          duration-300
          ${house ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="border-b px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Detail Rumah</h2>

            <p className="text-sm text-gray-500">Informasi rumah</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <X />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-90px)]">
          {house && <HouseCard house={house} />}
        </div>
      </div>
    </>
  );
}
