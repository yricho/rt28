"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function FilterStatus({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-12
        rounded-xl
        border
        bg-white
        px-4
        shadow
      "
    >
      <option value="all">Semua Status</option>

      <option value="occupied">Dihuni</option>

      <option value="empty">Kosong</option>

      <option value="renovation">Renovasi</option>

      <option value="unpaid">Menunggak IPL</option>
    </select>
  );
}
