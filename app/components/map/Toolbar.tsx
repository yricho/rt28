"use client";

import { Search, Plus, Filter } from "lucide-react";

export default function Toolbar() {
  return (
    <div className="flex flex-col lg:flex-row gap-3 w-full">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Cari rumah..."
          className="
            w-full
            h-12
            rounded-xl
            border
            bg-white
            pl-11
            pr-4
            text-sm
            shadow
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-200
          "
        />
      </div>

      {/* Filter */}
      <select
        className="
          h-12
          rounded-xl
          border
          bg-white
          px-4
          shadow
          outline-none
          lg:w-52
        "
      >
        <option>Semua Status</option>
        <option>Dihuni</option>
        <option>Kosong</option>
        <option>Renovasi</option>
        <option>Menunggak IPL</option>
      </select>

      {/* Filter Button */}
      {/* <button
        className="
          h-12
          w-12
          rounded-xl
          border
          bg-white
          shadow
          hover:bg-slate-100
          flex
          items-center
          justify-center
        "
      >
        <Filter size={20} />
      </button> */}

      {/* Add */}
      {/* <button
        className="
          h-12
          px-5
          rounded-xl
          bg-blue-600
          text-white
          shadow
          hover:bg-blue-700
          transition
          flex
          items-center
          justify-center
          gap-2
          whitespace-nowrap
        "
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Tambah Rumah</span>
      </button> */}
    </div>
  );
}
