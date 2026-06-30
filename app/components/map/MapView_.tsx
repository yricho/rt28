"use client";

import { useState } from "react";

import { MapContainer, TileLayer } from "react-leaflet";

import HousePin from "./HousePin";
import HouseDrawer from "./HouseDrawer";
import { House } from "@/app/types/house";
import { houses } from "@/app/data/houses_";

export default function MapView() {
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  return (
    <>
      <MapContainer
        center={[-6.33002552539907, 106.49244718040303]}
        zoom={18}
        scrollWheelZoom
        className="h-screen w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {houses.map((house) => (
          <HousePin key={house.id} house={house} onClick={setSelectedHouse} />
        ))}
      </MapContainer>

      <HouseDrawer
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
      />
    </>
  );
}
