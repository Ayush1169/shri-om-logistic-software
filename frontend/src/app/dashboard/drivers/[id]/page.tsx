"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getDriverById } from "@/services/driver.service";
import { Driver } from "@/types/driver";

export default function ViewDriverPage() {
  const { id } = useParams();
  const router = useRouter();

  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDriver();
  }, []);

  const fetchDriver = async () => {
    try {
      const res = await getDriverById(Number(id));
      setDriver(res.driver);
    } catch (error) {
      console.error(error);
    }
  };

  if (!driver) {
    return (
      <div className="flex h-60 items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Driver Details
          </h1>

          <p className="text-gray-500">
            View complete driver information.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-lg border px-4 py-2"
        >
          Back
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Driver Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Info label="Driver Name" value={driver.driverName} />
          <Info label="Mobile" value={driver.mobile} />
          <Info label="Aadhaar" value={driver.aadhaarNumber} />
          <Info label="License" value={driver.licenseNumber} />
          <Info label="Address" value={driver.address} />
          <Info
            label="Emergency Contact"
            value={driver.emergencyContact || "-"}
          />
          <Info
            label="Company"
            value={driver.company?.companyName || "-"}
          />
          <Info
            label="Status"
            value={driver.isActive ? "Active" : "Inactive"}
          />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Documents
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Info
            label="License Expiry"
            value={
              driver.document?.licenseExpiry?.slice(0, 10) || "-"
            }
          />

          <Info
            label="Aadhaar Front"
            value={driver.document?.aadhaarFront || "-"}
          />

          <Info
            label="Aadhaar Back"
            value={driver.document?.aadhaarBack || "-"}
          />

          <Info
            label="License Image"
            value={driver.document?.licenseImage || "-"}
          />
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}