"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import DriverForm from "@/components/drivers/DriverForm";
import { getDriverById } from "@/services/driver.service";
import { Driver } from "@/types/driver";

export default function EditDriverPage() {
  const { id } = useParams();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriver();
  }, []);

  const fetchDriver = async () => {
    try {
      const res = await getDriverById(Number(id));
      setDriver(res.driver);
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

  if (!driver) {
    return (
      <div className="flex h-60 items-center justify-center">
        Driver Not Found
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Edit Driver
        </h1>

        <p className="mt-1 text-gray-500">
          Update driver details.
        </p>
      </div>

      <DriverForm
        initialData={driver}
        isEdit
      />
    </div>
  );
}