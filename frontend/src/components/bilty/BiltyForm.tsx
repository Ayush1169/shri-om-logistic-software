"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Bilty,
  PaymentType,
} from "@/types/bilty";

import {
  createBilty,
  updateBilty,
} from "@/services/bilty.service";

import { getCustomers } from "@/services/customer.service";
import { getVehicles } from "@/services/vehicle.service";
import { getDrivers } from "@/services/driver.service";

interface Props {
  bilty?: Bilty;
  isEdit?: boolean;
}

export default function BiltyForm({
  bilty,
  isEdit = false,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [form, setForm] = useState({
    consignorId: "",
    consigneeId: "",

    vehicleId: "",
    driverId: "",

    pickupAddress: "",
    deliveryAddress: "",

    goodsDescription: "",

    packageCount: "",

    actualWeight: "",
    chargeableWeight: "",

    freight: "",
    gst: "",

    hamali: "",
    loadingCharges: "",
    unloadingCharges: "",
    insuranceCharges: "",

    paymentType: "PAID" as PaymentType,

    eWayBillNumber: "",

    remarks: "",
  });

  /**
   * Load Master Data
   */
  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [
        customerRes,
        vehicleRes,
        driverRes,
      ] = await Promise.all([
        getCustomers(),
        getVehicles(),
        getDrivers(),
      ]);

      setCustomers(customerRes.customers || []);
      setVehicles(vehicleRes.vehicles || []);
      setDrivers(driverRes.drivers || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load master data");
    }
  };

  /**
   * Edit Mode
   */
  useEffect(() => {
    if (!bilty) return;

    setForm({
      consignorId: String(bilty.consignorId),
      consigneeId: String(bilty.consigneeId),

      vehicleId: bilty.vehicleId
        ? String(bilty.vehicleId)
        : "",

      driverId: bilty.driverId
        ? String(bilty.driverId)
        : "",

      pickupAddress: bilty.pickupAddress,
      deliveryAddress: bilty.deliveryAddress,

      goodsDescription: bilty.goodsDescription,

      packageCount: String(bilty.packageCount),

      actualWeight: String(
        bilty.actualWeight ?? ""
      ),

      chargeableWeight: String(
        bilty.chargeableWeight ?? ""
      ),

      freight: String(bilty.freight),

      gst: String(bilty.gst ?? ""),

      hamali: String(bilty.hamali ?? ""),

      loadingCharges: String(
        bilty.loadingCharges ?? ""
      ),

      unloadingCharges: String(
        bilty.unloadingCharges ?? ""
      ),

      insuranceCharges: String(
        bilty.insuranceCharges ?? ""
      ),

      paymentType: bilty.paymentType,

      eWayBillNumber:
        bilty.eWayBillNumber || "",

      remarks: bilty.remarks || "",
    });
  }, [bilty]);

  /**
   * Total Amount
   */
  const totalAmount = useMemo(() => {
    return (
      Number(form.freight || 0) +
      Number(form.gst || 0) +
      Number(form.hamali || 0) +
      Number(form.loadingCharges || 0) +
      Number(form.unloadingCharges || 0) +
      Number(form.insuranceCharges || 0)
    );
  }, [form]);

  /**
   * Handle Change
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Submit
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        branchId: 1,

        consignorId: Number(form.consignorId),
        consigneeId: Number(form.consigneeId),

        vehicleId: form.vehicleId
          ? Number(form.vehicleId)
          : null,

        driverId: form.driverId
          ? Number(form.driverId)
          : null,

        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,

        goodsDescription: form.goodsDescription,

        packageCount: Number(form.packageCount),

        actualWeight: form.actualWeight
          ? Number(form.actualWeight)
          : null,

        chargeableWeight: form.chargeableWeight
          ? Number(form.chargeableWeight)
          : null,

        freight: Number(form.freight),

        gst: Number(form.gst || 0),

        hamali: Number(form.hamali || 0),

        loadingCharges: Number(
          form.loadingCharges || 0
        ),

        unloadingCharges: Number(
          form.unloadingCharges || 0
        ),

        insuranceCharges: Number(
          form.insuranceCharges || 0
        ),

        paymentType: form.paymentType,

        eWayBillNumber:
          form.eWayBillNumber,

        remarks: form.remarks,
      };
            if (isEdit && bilty) {
        await updateBilty(bilty.id, payload);
        toast.success("Bilty updated successfully.");
      } else {
        await createBilty(payload);
        toast.success("Bilty created successfully.");
      }

      router.push("/dashboard/bilties");
      router.refresh();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      {/* Basic Details */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Basic Details
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* Consignor */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Consignor
            </label>

            <select
              name="consignorId"
              value={form.consignorId}
              onChange={handleChange}
              className="w-full rounded-lg border p-2"
              required
            >
              <option value="">Select Consignor</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.customerName}
                </option>
              ))}
            </select>
          </div>

          {/* Consignee */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Consignee
            </label>

            <select
              name="consigneeId"
              value={form.consigneeId}
              onChange={handleChange}
              className="w-full rounded-lg border p-2"
              required
            >
              <option value="">Select Consignee</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.customerName}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Vehicle
            </label>

            <select
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Select Vehicle</option>

              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                >
                  {vehicle.vehicleNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Driver */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Driver
            </label>

            <select
              name="driverId"
              value={form.driverId}
              onChange={handleChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Select Driver</option>

              {drivers.map((driver) => (
                <option
                  key={driver.id}
                  value={driver.id}
                >
                  {driver.driverName}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Type */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Payment Type
            </label>

            <select
              name="paymentType"
              value={form.paymentType}
              onChange={handleChange}
              className="w-full rounded-lg border p-2"
            >
              <option value="PAID">Paid</option>
              <option value="TO_PAY">To Pay</option>
              <option value="BILLING">Billing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Address Details
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            name="pickupAddress"
            placeholder="Pickup Address"
            value={form.pickupAddress}
            onChange={handleChange}
            className="rounded-lg border p-2"
            required
          />

          <input
            type="text"
            name="deliveryAddress"
            placeholder="Delivery Address"
            value={form.deliveryAddress}
            onChange={handleChange}
            className="rounded-lg border p-2"
            required
          />
        </div>
      </div>

      {/* Goods */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Goods Details
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            name="goodsDescription"
            placeholder="Goods Description"
            value={form.goodsDescription}
            onChange={handleChange}
            className="rounded-lg border p-2"
            required
          />

          <input
            type="number"
            name="packageCount"
            placeholder="Package Count"
            value={form.packageCount}
            onChange={handleChange}
            className="rounded-lg border p-2"
            required
          />

          <input
            type="number"
            name="actualWeight"
            placeholder="Actual Weight"
            value={form.actualWeight}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="number"
            name="chargeableWeight"
            placeholder="Chargeable Weight"
            value={form.chargeableWeight}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />
        </div>
      </div>
            {/* Charges */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Charges
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <input
            type="number"
            name="freight"
            placeholder="Freight"
            value={form.freight}
            onChange={handleChange}
            className="rounded-lg border p-2"
            required
          />

          <input
            type="number"
            name="gst"
            placeholder="GST"
            value={form.gst}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="number"
            name="hamali"
            placeholder="Hamali"
            value={form.hamali}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="number"
            name="loadingCharges"
            placeholder="Loading Charges"
            value={form.loadingCharges}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="number"
            name="unloadingCharges"
            placeholder="Unloading Charges"
            value={form.unloadingCharges}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="number"
            name="insuranceCharges"
            placeholder="Insurance Charges"
            value={form.insuranceCharges}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />
        </div>
      </div>

      {/* Other Details */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Other Details
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            name="eWayBillNumber"
            placeholder="E-Way Bill Number"
            value={form.eWayBillNumber}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <textarea
            name="remarks"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={4}
            className="rounded-lg border p-2"
          />
        </div>
      </div>

      {/* Total */}
      <div className="rounded-lg border bg-blue-50 p-5">
        <h3 className="text-lg font-semibold">
          Total Amount
        </h3>

        <p className="mt-2 text-3xl font-bold text-blue-600">
          ₹ {totalAmount.toLocaleString()}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-5 py-2 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEdit
            ? "Update Bilty"
            : "Create Bilty"}
        </button>

      </div>

    </form>
  );
}