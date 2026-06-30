"use client";

export default function Legend() {
  const items = [
    {
      color: "bg-green-500",
      label: "Dihuni",
    },
    {
      color: "bg-gray-700",
      label: "Kosong",
    },
    // {
    //   color: "bg-yellow-400",
    //   label: "Renovasi",
    // },
    // {
    //   color: "bg-red-500",
    //   label: "Menunggak",
    // },
  ];

  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-lg
        border
        p-4
        w-full
        lg:w-56
      "
    >
      <h3 className="font-semibold text-sm mb-3">Status Rumah</h3>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${item.color}`} />

            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
