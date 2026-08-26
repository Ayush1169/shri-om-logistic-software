"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createVehicle,
  updateVehicle,
} from "@/services/vehicle.service";

import { Vehicle } from "@/types/vehicle";

type Props = {
  initialData?: Vehicle;
  isEdit?: boolean;
};

export default function VehicleForm({
  initialData,
  isEdit = false,
}: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    vehicleNumber: initialData?.vehicleNumber || "",
    ownerName: initialData?.ownerName || "",
    vehicleType: initialData?.vehicleType || "",
    capacity: initialData?.capacity?.toString() || "",
    gpsNumber: initialData?.gpsNumber || "",

    rcNumber: initialData?.document?.rcNumber || "",
    insuranceNumber:
      initialData?.document?.insuranceNumber || "",
    permitNumber:
      initialData?.document?.permitNumber || "",
    fitnessNumber:
      initialData?.document?.fitnessNumber || "",
    pollutionNumber:
      initialData?.document?.pollutionNumber || "",

    insuranceExpiry:
      initialData?.document?.insuranceExpiry?.slice(0, 10) ||
      "",

    permitExpiry:
      initialData?.document?.permitExpiry?.slice(0, 10) ||
      "",

    fitnessExpiry:
      initialData?.document?.fitnessExpiry?.slice(0, 10) ||
      "",

    pollutionExpiry:
      initialData?.document?.pollutionExpiry?.slice(0, 10) ||
      "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

     if (isEdit && initialData) {
  await updateVehicle(initialData.id, payload);
  toast.success("Vehicle updated successfully");
} else {
  await createVehicle(payload);
  toast.success("Vehicle created successfully");
}

router.push("/dashboard/vehicle");

    }  catch (error: any) {
  console.log(error.response?.data);

  toast.error(
    error.response?.data?.message || "Something went wrong"
  );
}   finally {
  setLoading(false);
}
};
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-xl bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-bold">
        {isEdit ? "Edit Vehicle" : "Vehicle Details"}
      </h2>

      {/* Vehicle Information */}

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Vehicle Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block font-medium">
              Vehicle Number
            </label>

            <input
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Owner Name
            </label>

            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Vehicle Type
            </label>

            <input
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Capacity (Ton)
            </label>

            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium">
              GPS Number
            </label>

            <input
              name="gpsNumber"
              value={formData.gpsNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

        </div>
      </div>

      {/* Document Information */}

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Document Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block font-medium">
              RC Number
            </label>

            <input
              name="rcNumber"
              value={formData.rcNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Insurance Number
            </label>

            <input
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Insurance Expiry
            </label>

            <input
              type="date"
              name="insuranceExpiry"
              value={formData.insuranceExpiry}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Permit Number
            </label>

            <input
              name="permitNumber"
              value={formData.permitNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Permit Expiry
            </label>

            <input
              type="date"
              name="permitExpiry"
              value={formData.permitExpiry}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Fitness Number
            </label>

            <input
              name="fitnessNumber"
              value={formData.fitnessNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Fitness Expiry
            </label>

            <input
              type="date"
              name="fitnessExpiry"
              value={formData.fitnessExpiry}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Pollution Number
            </label>

            <input
              name="pollutionNumber"
              value={formData.pollutionNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Pollution Expiry
            </label>

            <input
              type="date"
              name="pollutionExpiry"
              value={formData.pollutionExpiry}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
  type="button"
  disabled={loading}
  onClick={() => router.push("/dashboard/vehicle")}
  className="rounded-lg border px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
>
  Cancel
</button>

       <button
  type="submit"
  disabled={loading}
  className="rounded-lg bg-blue-600 px-5 py-3 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading
    ? isEdit
      ? "Updating..."
      : "Saving..."
    : isEdit
    ? "Update Vehicle"
    : "Save Vehicle"}
</button>
      </div>
    </form>
  );
}