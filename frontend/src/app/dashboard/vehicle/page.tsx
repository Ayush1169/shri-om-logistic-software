"use client";

import { useEffect, useState } from "react";

import {
  getVehicles,
  toggleVehicleStatus,
} from "@/services/vehicle.service";

import { Vehicle } from "@/types/vehicle";

import VehicleToolbar from "@/components/vehicle/VehicleToolbar";
import VehicleTable from "@/components/vehicle/VehicleTable";

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles(1, search);
      setVehicles(res.vehicles);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search]);

  const handleStatus = async (id: number) => {
    try {
      await toggleVehicleStatus(id);
      fetchVehicles();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Vehicle Management
        </h1>

        <p className="mt-1 text-gray-500">
          Manage all company vehicles.
        </p>
      </div>

      <VehicleToolbar
        search={search}
        setSearch={setSearch}
      />

      <VehicleTable
        vehicles={vehicles}
        onStatus={handleStatus}
      />

    </div>
  );
}