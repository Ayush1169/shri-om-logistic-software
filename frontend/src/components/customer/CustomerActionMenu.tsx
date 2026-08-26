import Link from "next/link";
import { Customer } from "@/types/customer";

type Props = {
  customer: Customer;
  onView: () => void;
  onEdit: () => void;
  onStatus: () => void;
};

export default function CustomerActionMenu({
  customer,
  onView,
  onEdit,
  onStatus,
}: Props) {
  return (
    <div className="flex gap-2">
     
     <Link
  href={`/dashboard/customer/${customer.id}`}
  className="rounded bg-blue-500 px-3 py-1 text-white"
>
  View
</Link>

      <Link
  href={`/dashboard/customer/${customer.id}/edit`}
  className="rounded bg-yellow-500 px-3 py-1 text-white"
>
  Edit
</Link>

      <button
        onClick={onStatus}
        className={`rounded px-3 py-1 text-white ${
          customer.isActive
            ? "bg-red-500"
            : "bg-green-500"
        }`}
      >
        {customer.isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}