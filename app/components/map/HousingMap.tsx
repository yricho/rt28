"use client";

import { useState } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { getHouses } from "@/app/services/houseService";
import { House } from "@/app/types/house";

import { useEffect } from "react";
import HouseDrawer from "./HouseDrawer";
import HousePin from "./HousePin";
import Legend from "./Legend";
import Stats from "./Stats";

export default function HousingMap() {
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    loadHouse();
  }, []);

  async function loadHouse() {
    const data = await getHouses();

    setHouses(data);
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Floating UI */}
      {/* <div className="absolute left-6 top-6 z-[1000] w-96">
        <Toolbar />
      </div> */}

      <div className="absolute left-14 top-2 z-[1000]">
        <Stats houses={houses} />
      </div>

      <div className="absolute bottom-6 left-6 z-[1000]">
        <Legend />
      </div>

      {/* MAP */}
      <MapContainer
        center={[-6.33002552539907, 106.49244718040303]}
        zoom={18}
        maxZoom={19}
        zoomControl={true}
        scrollWheelZoom
        className="h-full w-full"
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
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
    </div>
  );
}
