"use client";

import { useEffect, useState } from "react";

import {
  getDrivers,
  toggleDriverStatus,
} from "@/services/driver.service";

import { Driver } from "@/types/driver";

import DriverToolbar from "@/components/drivers/DriverToolbar";
import DriverTable from "@/components/drivers/DriverTable";

export default function DriverPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");

  const fetchDrivers = async () => {
    try {
      const res = await getDrivers(1, search);
      setDrivers(res.drivers);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search]);

  const handleStatus = async (id: number) => {
    try {
      await toggleDriverStatus(id);
      fetchDrivers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Driver Management
        </h1>

        <p className="mt-1 text-gray-500">
          Manage all company drivers.
        </p>
      </div>

      <DriverToolbar
        search={search}
        setSearch={setSearch}
      />

      <DriverTable
        drivers={drivers}
        onStatus={handleStatus}
      />

    </div>
  );
}