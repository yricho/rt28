"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { getHouses } from "@/app/services/houseService";
import { House } from "@/app/types/house";

import HouseDrawer from "./HouseDrawer";
import HousePin from "./HousePin";
import Legend from "./Legend";
import Stats from "./Stats";

export default function HousingMap() {
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHouse() {
      try {
        const data = await getHouses();

        if (!active) return;

        setHouses(data);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "Gagal memuat data rumah",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHouse();

    return () => {
      active = false;
    };
  }, []);

  const validHouses = useMemo(
    () =>
      houses.filter((house) => {
        const lat = Number(house.latitude);
        const lng = Number(house.longitude);

        return Number.isFinite(lat) && Number.isFinite(lng);
      }),
    [houses],
  );

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

        {validHouses.map((house) => (
          <HousePin key={house.id} house={house} onClick={setSelectedHouse} />
        ))}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/70">
          <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      )}

      {error && (
        <div className="absolute left-1/2 top-6 z-[2000] -translate-x-1/2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow">
          {error}
        </div>
      )}

      <HouseDrawer
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
      />
    </div>
  );
}
