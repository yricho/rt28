export type WargaRingkas = {
  nama: string;
  no_hp: string | null;
};

export type RumahRingkas = {
  id: string;
  blok: string;
  no_rumah: string;
  alamat?: string | null;
  warga: WargaRingkas | null;
};

export type TagihanIPLItem = {
  id: string;
  bulan: string;
  tahun: number;
  nominal: number;
  status: string | null;
  metode_pembayaran?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
};
