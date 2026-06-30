"use client";

import { Home, House, Hammer, AlertTriangle } from "lucide-react";
import { House as HouseType } from "@/app/types/house";

interface Props {
  houses?: HouseType[];
}

export default function Stats({ houses = [] }: Props) {
  const occupied = houses.filter((h) => h.status === "active").length;

  const empty = houses.filter((h) => h.status === "nonactive").length;

  // const renovation = houses.filter(
  //   (h) => h.status === "renovation",
  // ).length;

  console.log(houses,"<-------")
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* <Card
        title="Total Rumah"
        value={total}
        icon={<House size={24} />}
        color="bg-blue-100 text-blue-700"
      /> */}

      <Card
        title="Dihuni"
        value={occupied}
        icon={<Home size={24} />}
        color="bg-green-100 text-green-700"
      />

      <Card
        title="Kosong"
        value={empty}
        icon={<House size={24} />}
        color="bg-gray-100 text-gray-700"
      />

      {/* <Card
        title="Renovasi"
        value={renovation}
        icon={<Hammer size={24} />}
        color="bg-yellow-100 text-yellow-700"
      /> */}
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow border p-4 flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">{title}</p>

        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
    </div>
  );
}
