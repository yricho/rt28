import L from "leaflet";

export function createMarker(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:26px;
          height:26px;
          border-radius:9999px;
          background:${color};
          border:4px solid #fff;
          box-shadow:0 4px 12px rgba(0,0,0,.35);
        "
      ></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
  });
}