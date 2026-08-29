"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";

import { BiltyGroup } from "@/types/bilty";
import BiltyStatusBadge from "./BiltyStatusBadge";
import BiltyActionMenu from "./BiltyActionMenu";

interface Props {
  groups: BiltyGroup[];
  loading?: boolean;
  onDelete: (id: number) => void;
  onGroupDelete: (challanId: number) => void;
}

export default function BiltyTable({
  groups = [],
  loading = false,
  onDelete,
  onGroupDelete,
}: Props) {
  const [openGroups, setOpenGroups] =
    useState<string[]>([]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        Loading bilties...
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        No Bilty Found
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {groups.map((group) => {
        const isOpen =
          openGroups.includes(group.id);

        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
          >

            {/* VEHICLE / CHALLAN HEADER */}

            <button
              type="button"
              onClick={() =>
                toggleGroup(group.id)
              }
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
            >

              <div className="flex items-center gap-4">

                {isOpen ? (
                  <ChevronDown size={22} />
                ) : (
                  <ChevronRight size={22} />
                )}

                <div>

                  <div className="flex items-center gap-3">
  <div className="text-lg font-bold">
    🚚 {group.vehicleNumber}
  </div>

  {group.challanId !== null && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onGroupDelete(group.challanId);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      <Trash2 size={16} />
      Delete
    </button>
  )}
</div>

                  {group.challanNumber && (
                    <div className="text-sm text-gray-500">
                      Challan:{" "}
                      {group.challanNumber}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    {group.totalBilties} Bilties
                  </div>

                </div>

              </div>

              <div className="flex gap-8">

                <div className="text-center">
                  <div className="text-xs text-gray-500">
                    Packages
                  </div>
                  <div className="font-semibold">
                    {group.totalPackages}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-gray-500">
                    Weight
                  </div>
                  <div className="font-semibold">
                    {group.totalWeight} KG
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-gray-500">
                    Freight
                  </div>
                  <div className="font-semibold">
                    ₹
                    {group.totalFreight.toLocaleString()}
                  </div>
                </div>

              </div>

            </button>

            {/* BILTIES */}

            {isOpen && (
              <div className="border-t">

                <div className="overflow-x-auto">

                  <table className="min-w-full text-sm">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-4 py-3 text-left">
                          Bilty No
                        </th>

                        <th className="px-4 py-3 text-left">
                          Date
                        </th>

                        <th className="px-4 py-3 text-left">
                          Consignor
                        </th>

                        <th className="px-4 py-3 text-left">
                          Consignee
                        </th>

                        <th className="px-4 py-3 text-left">
                          P.Marka
                        </th>

                        <th className="px-4 py-3 text-left">
                          Goods
                        </th>

                        <th className="px-4 py-3 text-right">
                          Packages
                        </th>

                        <th className="px-4 py-3 text-right">
                          Weight
                        </th>

                        <th className="px-4 py-3 text-right">
                          Freight
                        </th>

                        <th className="px-4 py-3 text-center">
                          Status
                        </th>

                        <th className="px-4 py-3 text-center">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {group.bilties.map(
                        (bilty) => (

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
                              {bilty.consignor
                                ?.customerName ||
                                "-"}
                            </td>

                            <td className="px-4 py-3">
                              {bilty.consigneeName ||
                                bilty.consignee
                                  ?.customerName ||
                                "-"}
                            </td>

                            <td className="px-4 py-3">
                              {bilty.pMarka || "-"}
                            </td>

                            <td className="px-4 py-3">
                              {bilty.goodsDescription ||
                                "-"}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {bilty.packageCount}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {bilty.actualWeight || 0} KG
                            </td>

                            <td className="px-4 py-3 text-right font-semibold">
                              ₹
                              {Number(
                                bilty.freight
                              ).toLocaleString()}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <BiltyStatusBadge
                                status={
                                  bilty.status
                                }
                              />
                            </td>

                            <td className="px-4 py-3">
                              <BiltyActionMenu
                                id={bilty.id}
                                onDelete={
                                  onDelete
                                }
                              />
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}