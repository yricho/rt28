"use client";

import dynamic from "next/dynamic";

const HousingMap = dynamic(() => import("../../components/map/HousingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="h-screen bg-slate-100">
      <HousingMap />
    </div>
  );
}
