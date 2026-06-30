"use client";

import {
  GoogleMap,
  Marker,
  StandaloneSearchBox,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useEffect, useRef, useState } from "react";

interface Props {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

const libraries: "places"[] = ["places"];

const DEFAULT_CENTER = {
  lat: -6.3300384749502445,
  lng: 106.4924421714059,
};

export default function GoogleLocationPicker({
  latitude,
  longitude,
  onChange,
}: Props) {
  const searchRef = useRef<google.maps.places.SearchBox | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries,
  });

  const [center, setCenter] = useState(DEFAULT_CENTER);

  const [myLocation, setMyLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  // update ketika edit rumah lain
  useEffect(() => {
    if (!latitude || !longitude) return;

    setCenter({
      lat: Number(latitude),
      lng: Number(longitude),
    });
  }, [latitude, longitude]);

  // otomatis ambil lokasi saya pertama kali
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setMyLocation({
          lat,
          lng,
        });
      },
      () => {},
      {
        enableHighAccuracy: true,
      },
    );
  }, []);

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* <StandaloneSearchBox
          onLoad={(ref) => (searchRef.current = ref)}
          onPlacesChanged={() => {
            const place = searchRef.current?.getPlaces()?.[0];

            if (!place?.geometry?.location) return;

            const lat = place.geometry.location.lat();

            const lng = place.geometry.location.lng();

            setCenter({
              lat,
              lng,
            });

            onChange(String(lat), String(lng));
          }}
        >
          <input
            placeholder="Cari alamat..."
            className="flex-1 rounded-xl border px-4 py-2"
          />
        </StandaloneSearchBox> */}

        <button
          type="button"
          className="rounded-xl bg-blue-600 p-4 text-white w-full font-bold"
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setMyLocation({
                  lat,
                  lng,
                });

                setCenter({
                  lat,
                  lng,
                });

                onChange(String(lat), String(lng));
              },
              () => alert("Lokasi tidak ditemukan"),
              {
                enableHighAccuracy: true,
              },
            );
          }}
        >
          📍 Lokasi Saya
        </button>
      </div>

      <GoogleMap
        zoom={20}
        center={center}
        mapContainerStyle={{
          width: "100%",
          height: "450px",
          borderRadius: "16px",
        }}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
        onClick={(e) => {
          if (!e.latLng) return;

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          setCenter({
            lat,
            lng,
          });

          onChange(String(lat), String(lng));
        }}
      >
        {/* Marker lokasi saya */}
        {myLocation && (
          <Marker
            position={myLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}

        {/* Marker rumah */}
        <Marker
          position={center}
          draggable
          onDragEnd={(e) => {
            if (!e.latLng) return;

            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            setCenter({
              lat,
              lng,
            });

            onChange(String(lat), String(lng));
          }}
        />
      </GoogleMap>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded-xl border bg-gray-50 px-3 py-2"
          value={center.lat}
          readOnly
        />

        <input
          className="rounded-xl border bg-gray-50 px-3 py-2"
          value={center.lng}
          readOnly
        />
      </div>
    </div>
  );
}
