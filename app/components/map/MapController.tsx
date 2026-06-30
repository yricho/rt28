"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface Props {
  lat?: number;
  lng?: number;
}

export default function MapController({ lat, lng }: Props) {
  const map = useMap();

  useEffect(() => {
    if (lat == null || lng == null) return;

    map.flyTo([lat, lng], 19, {
      animate: true,
      duration: 1.2,
    });
  }, [lat, lng, map]);

  return null;
}
