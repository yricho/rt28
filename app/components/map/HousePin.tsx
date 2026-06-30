"use client";

import { Marker, Popup, Tooltip } from "react-leaflet";

import { House } from "@/app/types/house";
import { createMarker } from "./markerIcon";

interface Props {
  house: House;
  onClick: (house: House) => void;
}

export default function HousePin({ house, onClick }: Props) {
  // const color = {
  //   occupied: "#22c55e",
  //   empty: "#374151",
  //   renovation: "#facc15",
  //   unpaid: "#ef4444",
  // }[house.status];

  // const statusLabel = {
  //   occupied: "Dihuni",
  //   empty: "Kosong",
  //   renovation: "Renovasi",
  //   unpaid: "Menunggak IPL",
  // }[house.status];

  const color = {
    active: "#22c55e",
    nonactive: "#374151",
  }[house.status];
  const statusLabel = {
    active: "Dihuni",
    nonactive: "Kosong",
  }[house.status];

  const noRumah = `${house.blok}/${house.no_rumah}`;
  return (
    <Marker
      position={[Number(house.latitude), Number(house.longitude)]}
      icon={createMarker(color)}
      // eventHandlers={{
      //   click: () => onClick(house),
      // }}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        <div className="text-sm font-semibold">{noRumah}</div>
      </Tooltip>

      <Popup minWidth={230}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{noRumah}</h2>

            <span
              className={`px-2 py-1 rounded-full text-xs text-white ${house?.status === "active" ? "bg-green-500" : "bg-gray-500"}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="text-sm">
            <div className="capitalize text-2xl font-black">
              {/* <strong>Pemilik</strong>
              <br /> */}
              {house.warga?.nama || "-"}
            </div>

            {/* <p>
              <strong>Warga</strong>
              <br />
              {house.residents} Orang
            </p> */}

            {/* <p>
              <strong>Telepon</strong>
              <br />
              {house.phone || "-"}
            </p> */}

            {/* <p>
              <strong>IPL</strong>
              <br />
              {house.ipl}
            </p> */}
          </div>

          <button
            onClick={() => onClick(house)}
            className="
              w-full
              rounded-lg
              bg-blue-600
              py-2
              text-white
              hover:bg-blue-700
            "
          >
            Lihat Detail
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
