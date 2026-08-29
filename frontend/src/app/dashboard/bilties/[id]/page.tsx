"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";

import BiltyStatusBadge from "@/components/bilty/BiltyStatusBadge";
import { getBiltyById } from "@/services/bilty.service";
import { Bilty } from "@/types/bilty";

export default function BiltyDetailsPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [bilty, setBilty] = useState<Bilty | null>(null);

  useEffect(() => {
    loadBilty();
  }, []);

  const loadBilty = async () => {
    try {
      setLoading(true);

      const res = await getBiltyById(
        Number(params.id)
      );

      setBilty(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Bilty");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center">
        Loading Bilty...
      </div>
    );
  }

  if (!bilty) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center">
        Bilty not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Bilty Details
          </h1>

          <p className="text-gray-500">
            View transport bilty information
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            <Printer size={18} />
            Print
          </button>

          <Link
            href={`/dashboard/bilties/${bilty.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Pencil size={18} />
            Edit
          </Link>

          <Link
            href="/dashboard/bilties"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

        </div>

      </div>

      {/* Invoice Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center justify-between border-b pb-4">

          <div>
            <h2 className="text-2xl font-bold">
              Shri Om Logistics
            </h2>

            <p className="text-gray-500">
              Transport Bilty
            </p>
          </div>

          <BiltyStatusBadge
            status={bilty.status}
          />

        </div>
                {/* Bilty Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div className="space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Bilty Number
              </p>

              <p className="font-semibold">
                {bilty.biltyNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Booking Date
              </p>

              <p className="font-semibold">
                {new Date(
                  bilty.bookingDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Consignor
              </p>

              <p className="font-semibold">
                {bilty.consignor?.customerName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Consignee
              </p>

              <p className="font-semibold">
  {bilty.consignee?.customerName ||
    bilty.consigneeName ||
    "-"}
</p>
            </div>

          </div>

          <div className="space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Vehicle
              </p>

              <div>
  <p className="text-sm text-gray-500">
    P.Marka
  </p>

  <p className="font-semibold">
    {bilty.pMarka || "-"}
  </p>
</div>

              <p className="font-semibold">
                {bilty.vehicle?.vehicleNumber ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Driver
              </p>

              <p className="font-semibold">
                {bilty.driver?.driverName ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment Type
              </p>

              <p className="font-semibold">
                {bilty.paymentType}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Amount
              </p>

              <p className="text-lg font-bold text-blue-600">
                ₹
                {Number(
                  bilty.totalAmount
                ).toLocaleString()}
              </p>
            </div>

          </div>

        </div>

        {/* Address */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          <div className="rounded-lg border p-4">

            <h3 className="mb-3 text-lg font-semibold">
              Pickup Address
            </h3>

            <p className="text-gray-700 whitespace-pre-wrap">
              {bilty.pickupAddress || "-"}
            </p>

          </div>

          <div className="rounded-lg border p-4">

            <h3 className="mb-3 text-lg font-semibold">
              Delivery Address
            </h3>

            <p className="text-gray-700 whitespace-pre-wrap">
              {bilty.deliveryAddress || "-"}
            </p>

          </div>

        </div>

        {/* Goods Details */}
        <div className="mt-8 rounded-lg border p-5">

          <h3 className="mb-5 text-lg font-semibold">
            Goods Details
          </h3>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">

            <div>
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="font-semibold">
                {bilty.goodsDescription}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Packages
              </p>

              <p className="font-semibold">
                {bilty.packageCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Actual Weight
              </p>

              <p className="font-semibold">
                {bilty.actualWeight || "-"} KG
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Chargeable Weight
              </p>

              <p className="font-semibold">
                {bilty.chargeableWeight || "-"} KG
              </p>
            </div>

          </div>

        </div>
                {/* Charges */}
        <div className="mt-8 rounded-lg border p-5">

          <h3 className="mb-5 text-lg font-semibold">
            Charges Summary
          </h3>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>Freight</span>
              <span>₹{Number(bilty.freight).toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>
              <span>₹{Number(bilty.gst || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Hamali</span>
              <span>₹{Number(bilty.hamali || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>Loading Charges</span>
              <span>
                ₹{Number(bilty.loadingCharges || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Unloading Charges</span>
              <span>
                ₹{Number(bilty.unloadingCharges || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Insurance Charges</span>
              <span>
                ₹{Number(bilty.insuranceCharges || 0).toLocaleString()}
              </span>
            </div>

            <hr />

            <div className="flex justify-between text-lg font-bold text-blue-600">
              <span>Total Amount</span>
              <span>
                ₹{Number(bilty.totalAmount).toLocaleString()}
              </span>
            </div>

          </div>

        </div>

        {/* Other Details */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          <div className="rounded-lg border p-5">

            <h3 className="mb-3 text-lg font-semibold">
              E-Way Bill
            </h3>

            <p className="text-gray-700">
              {bilty.eWayBillNumber || "-"}
            </p>

          </div>

          <div className="rounded-lg border p-5">

            <h3 className="mb-3 text-lg font-semibold">
              Remarks
            </h3>

            <p className="whitespace-pre-wrap text-gray-700">
              {bilty.remarks || "-"}
            </p>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-6 text-center text-sm text-gray-500">
          Generated from Shri Om Logistics ERP
        </div>

      </div>

    </div>
  );
}