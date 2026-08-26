"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import VehicleForm from "@/components/vehicle/VehicleForm";
import { getVehicleById } from "@/services/vehicle.service";
import { Vehicle } from "@/types/vehicle";

export default function EditVehiclePage() {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      const res = await getVehicleById(Number(id));
      setVehicle(res.vehicle);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex h-60 items-center justify-center">
        Vehicle Not Found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Vehicle
        </h1>

        <p className="mt-1 text-gray-500">
          Update vehicle details.
        </p>
      </div>

      <VehicleForm
        initialData={vehicle}
        isEdit
      />
    </div>
  );
}