"use client";

import { House } from "@/app/types/house";

interface Props {
  house: House;
}

export default function HousePopup({ house }: Props) {
  const color = {
    active: "bg-green-500",
    nonactive: "bg-gray-700",
  }[house.status];

  return (
    <div
      className="
        absolute
        -top-32
        left-1/2
        -translate-x-1/2
        w-60
        rounded-xl
        bg-white
        shadow-2xl
        border
        p-4
        z-50
      "
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold">{house.blok}</h2>

        <div className={`w-3 h-3 rounded-full ${color}`} />
      </div>

      <p className="text-gray-500 mt-2">{house.status || "Belum dihuni"}</p>

      {/* <div className="mt-3 text-sm space-y-1">
        <p>👨‍👩‍👧 {house.residents} Warga</p>

        <p>📞 {house.phone || "-"}</p>

        <p>💳 IPL : {house.ipl}</p>
      </div> */}
    </div>
  );
}
