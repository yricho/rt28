"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface Props {
  lat: number;
  lng: number;
}

export default function FlyToHouse({ lat, lng }: Props) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 20, {
      animate: true,
      duration: 1.2,
    });
  }, [lat, lng, map]);

  return null;
}
