export interface House {
  id: string;

  no_rumah: string;

  blok: string;

  alamat: string;

  latitude: number;

  longitude: number;
  status: "active" | "nonactive";

  occupancy_status: "occupied" | "empty" | "renovation";

  warga: {
    id: string;

    nama: string;

    no_hp: string;
  } | null;
}
