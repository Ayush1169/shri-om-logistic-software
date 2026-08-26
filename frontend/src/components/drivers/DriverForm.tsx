"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createDriver,
  updateDriver,
} from "@/services/driver.service";

import { Driver } from "@/types/driver";

type Props = {
  initialData?: Driver;
  isEdit?: boolean;
};

export default function DriverForm({
  initialData,
  isEdit = false,
}: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    driverName: initialData?.driverName || "",
    mobile: initialData?.mobile || "",

    aadhaarNumber:
      initialData?.aadhaarNumber || "",

    licenseNumber:
      initialData?.licenseNumber || "",

    address:
      initialData?.address || "",

    emergencyContact:
      initialData?.emergencyContact || "",

    licenseExpiry:
      initialData?.document?.licenseExpiry?.slice(
        0,
        10
      ) || "",

    aadhaarFront:
      initialData?.document?.aadhaarFront || "",

    aadhaarBack:
      initialData?.document?.aadhaarBack || "",

    licenseImage:
      initialData?.document?.licenseImage || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
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
      if (isEdit && initialData) {
        await updateDriver(
          initialData.id,
          formData
        );

        toast.success(
          "Driver updated successfully"
        );
      } else {
        await createDriver(formData);

        toast.success(
          "Driver created successfully"
        );
      }

      router.push("/dashboard/drivers");
    } catch (error: any) {
      console.log(error.response?.data);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-xl bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-bold">
        {isEdit
          ? "Edit Driver"
          : "Driver Details"}
      </h2>

      {/* Driver Information */}

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Driver Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block font-medium">
              Driver Name
            </label>

            <input
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Mobile Number
            </label>

            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Aadhaar Number
            </label>

            <input
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              License Number
            </label>

            <input
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium">
              Address
            </label>

            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Emergency Contact
            </label>

            <input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>
                    <div>
            <label className="mb-2 block font-medium">
              License Expiry
            </label>

            <input
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
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
              Aadhaar Front Image
            </label>

            <input
              name="aadhaarFront"
              value={formData.aadhaarFront}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Aadhaar Back Image
            </label>

            <input
              name="aadhaarBack"
              value={formData.aadhaarBack}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block font-medium">
              License Image
            </label>

            <input
              name="licenseImage"
              value={formData.licenseImage}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>
          
        </div>
      </div>

      <div className="flex justify-end gap-3">

        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/dashboard/drivers")}
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
            ? "Update Driver"
            : "Save Driver"}
        </button>

      </div>
    </form>
  );
}