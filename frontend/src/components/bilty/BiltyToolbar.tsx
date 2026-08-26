"use client";

import Link from "next/link";
import { Search, Plus, Upload } from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  onUploadChallan: () => void;
}

export default function BiltyToolbar({
  search,
  setSearch,
  onUploadChallan,
}: Props) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold">
          Bilty Management
        </h1>

        <p className="text-sm text-gray-500">
          Manage all transport bilties
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-3 sm:flex-row">

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Bilty..."
            className="w-full rounded-lg border py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
          />
        </div>

        {/* Upload Challan */}
        <button
          type="button"
          onClick={onUploadChallan}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 transition hover:bg-blue-50"
        >
          <Upload size={18} />
          Upload Challan
        </button>

        {/* Add Bilty */}
        <Link
          href="/dashboard/bilties/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Bilty
        </Link>

      </div>
    </div>
  );
}