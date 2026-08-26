import Link from "next/link";
import { Vehicle } from "@/types/vehicle";

type Props = {
  vehicle: Vehicle;
  onView: () => void;
  onEdit: () => void;
  onStatus: () => void;
};

export default function VehicleActionMenu({
  vehicle,
  onView,
  onEdit,
  onStatus,
}: Props) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/dashboard/vehicle/${vehicle.id}`}
        className="rounded bg-blue-500 px-3 py-1 text-white"
      >
        View
      </Link>

      <Link
        href={`/dashboard/vehicle/${vehicle.id}/edit`}
        className="rounded bg-yellow-500 px-3 py-1 text-white"
      >
        Edit
      </Link>

      <button
        onClick={onStatus}
        className={`rounded px-3 py-1 text-white ${
          vehicle.isActive
            ? "bg-red-500"
            : "bg-green-500"
        }`}
      >
        {vehicle.isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}