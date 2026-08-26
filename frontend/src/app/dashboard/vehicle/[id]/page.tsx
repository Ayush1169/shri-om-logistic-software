"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getVehicleById } from "@/services/vehicle.service";
import { Vehicle } from "@/types/vehicle";

export default function ViewVehiclePage() {
  const { id } = useParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      const res = await getVehicleById(Number(id));
      setVehicle(res.vehicle);
    } catch (error) {
      console.error(error);
    }
  };

  if (!vehicle) {
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
            Vehicle Details
          </h1>

          <p className="text-gray-500">
            View complete vehicle information.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-lg border px-4 py-2"
        >
          Back
        </button>
      </div>

      {/* Vehicle Information */}

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Vehicle Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Info label="Vehicle Number" value={vehicle.vehicleNumber} />

          <Info label="Owner Name" value={vehicle.ownerName} />

          <Info label="Vehicle Type" value={vehicle.vehicleType} />

          <Info label="Capacity" value={`${vehicle.capacity} Ton`} />

          <Info label="GPS Number" value={vehicle.gpsNumber || "-"} />

          <Info
            label="Status"
            value={vehicle.isActive ? "Active" : "Inactive"}
          />
        </div>
      </div>

      {/* Documents */}

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Documents
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Info
            label="RC Number"
            value={vehicle.document?.rcNumber || "-"}
          />

          <Info
            label="Insurance Number"
            value={vehicle.document?.insuranceNumber || "-"}
          />

          <Info
            label="Permit Number"
            value={vehicle.document?.permitNumber || "-"}
          />

          <Info
            label="Fitness Number"
            value={vehicle.document?.fitnessNumber || "-"}
          />

          <Info
            label="Pollution Number"
            value={vehicle.document?.pollutionNumber || "-"}
          />

          <Info
            label="Insurance Expiry"
            value={
              vehicle.document?.insuranceExpiry?.slice(0, 10) || "-"
            }
          />

          <Info
            label="Permit Expiry"
            value={
              vehicle.document?.permitExpiry?.slice(0, 10) || "-"
            }
          />

          <Info
            label="Fitness Expiry"
            value={
              vehicle.document?.fitnessExpiry?.slice(0, 10) || "-"
            }
          />

          <Info
            label="Pollution Expiry"
            value={
              vehicle.document?.pollutionExpiry?.slice(0, 10) || "-"
            }
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