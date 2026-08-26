import Link from "next/link";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function VehicleToolbar({
  search,
  setSearch,
}: Props) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <input
        type="text"
        placeholder="Search Vehicle..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-72 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <Link
        href="/dashboard/vehicle/add"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + Add Vehicle
      </Link>
    </div>
  );
}