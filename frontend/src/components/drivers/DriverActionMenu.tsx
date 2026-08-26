import Link from "next/link";
import { Driver } from "@/types/driver";

type Props = {
  driver: Driver;
  onView: () => void;
  onEdit: () => void;
  onStatus: () => void;
};

export default function DriverActionMenu({
  driver,
  onView,
  onEdit,
  onStatus,
}: Props) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/dashboard/drivers/${driver.id}`}
        className="rounded bg-blue-500 px-3 py-1 text-white"
      >
        View
      </Link>

      <Link
        href={`/dashboard/drivers/${driver.id}/edit`}
        className="rounded bg-yellow-500 px-3 py-1 text-white"
      >
        Edit
      </Link>

      <button
        onClick={onStatus}
        className={`rounded px-3 py-1 text-white ${
          driver.isActive
            ? "bg-red-500"
            : "bg-green-500"
        }`}
      >
        {driver.isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}