"use client";

import VehicleForm from "@/components/vehicle/VehicleForm";

export default function AddVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Add Vehicle
        </h1>

        <p className="mt-1 text-gray-500">
          Create a new vehicle for your company.
        </p>
      </div>

      <VehicleForm />
    </div>
  );
}