import { BiltyStatus } from "@/types/bilty";

type Props = {
  status: BiltyStatus;
};

const styles: Record<BiltyStatus, string> = {
  BOOKED: "bg-blue-100 text-blue-700",
  LOADED: "bg-yellow-100 text-yellow-700",
  IN_TRANSIT: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function BiltyStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}