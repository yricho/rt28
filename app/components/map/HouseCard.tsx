"use client";

import { Home, MapPinned, Phone } from "lucide-react";

import { House } from "@/app/types/house";

interface Props {
  house: House;
}

export default function HouseCard({ house }: Props) {
  const badge = {
    active: "bg-green-100 text-green-700",
    nonactive: "bg-gray-100 text-gray-700",
  }[house.status];

  const label = {
    active: "Dihuni",
    nonactive: "Kosong",
  }[house.status];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold">{house.blok}</h2>

              <p className="text-gray-500">
                Blok {house.blok} No {house.no_rumah}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${badge}`}
            >
              {label}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <Item
            icon={<Home size={18} />}
            title="Pemilik"
            value={house.warga?.nama}
          />

          {/* <Item
            icon={<Users size={18} />}
            title="Jumlah Warga"
            value={`${house.residents} Orang`}
          /> */}

          <Item
            icon={<Phone size={18} />}
            title="Telepon"
            value={house.warga?.no_hp}
          />

          {/* <Item icon={<CreditCard size={18} />} title="IPL" value={house.ipl} /> */}

          <Item
            icon={<MapPinned size={18} />}
            title="Koordinat"
            value={`${house.latitude}, ${house.longitude}`}
          />
        </div>
      </div>
    </div>
  );
}

function Item({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string | undefined;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <p className="font-semibold">{value ?? "-"}</p>
      </div>
    </div>
  );
}
