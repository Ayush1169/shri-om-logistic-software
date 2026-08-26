"use client";

import Link from "next/link";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function DriverToolbar({
  search,
  setSearch,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <input
        type="text"
        placeholder="Search by Driver Name, Mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-3 md:w-96"
      />

      <Link
        href="/dashboard/drivers/add"
        className="rounded-lg bg-blue-600 px-5 py-3 text-center text-white transition hover:bg-blue-700"
      >
        + Add Driver
      </Link>

    </div>
  );
}