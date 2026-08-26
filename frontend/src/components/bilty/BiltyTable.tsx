"use client";

import { Bilty } from "@/types/bilty";
import BiltyStatusBadge from "./BiltyStatusBadge";
import BiltyActionMenu from "./BiltyActionMenu";

interface Props {
  bilties: Bilty[];
  loading?: boolean;
  onDelete: (id: number) => void;
}

export default function BiltyTable({
  bilties,
  loading = false,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        Loading bilties...
      </div>
    );
  }

  if (bilties.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        No Bilty Found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Bilty No</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Consignor</th>
            <th className="px-4 py-3 text-left">Consignee</th>
            <th className="px-4 py-3 text-left">Vehicle</th>
            <th className="px-4 py-3 text-left">Driver</th>
            <th className="px-4 py-3 text-left">Destination</th>
            <th className="px-4 py-3 text-right">Freight</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {bilties.map((bilty) => (
            <tr
              key={bilty.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">
                {bilty.biltyNumber}
              </td>

              <td className="px-4 py-3">
                {new Date(
                  bilty.bookingDate
                ).toLocaleDateString()}
              </td>

              <td className="px-4 py-3">
                {bilty.consignor?.customerName || "-"}
              </td>

              <td className="px-4 py-3">
  {bilty.consignee?.customerName ||
    bilty.consigneeName ||
    "-"}
</td>

              <td className="px-4 py-3">
                {bilty.vehicle?.vehicleNumber || "-"}
              </td>

              <td className="px-4 py-3">
                {bilty.driver?.driverName || "-"}
              </td>

              <td className="px-4 py-3">
                {bilty.deliveryAddress || "-"}
              </td>

              <td className="px-4 py-3 text-right font-semibold">
                ₹{Number(bilty.freight).toLocaleString()}
              </td>

              <td className="px-4 py-3 text-center">
                <BiltyStatusBadge
                  status={bilty.status}
                />
              </td>

              <td className="px-4 py-3">
                <BiltyActionMenu
                  id={bilty.id}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}