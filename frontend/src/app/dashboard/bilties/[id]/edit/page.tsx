"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import BiltyForm from "@/components/bilty/BiltyForm";
import { getBiltyById } from "@/services/bilty.service";
import { Bilty } from "@/types/bilty";

export default function EditBiltyPage() {
  const params = useParams();

  const [bilty, setBilty] = useState<Bilty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilty();
  }, []);

  const loadBilty = async () => {
    try {
      setLoading(true);

      const res = await getBiltyById(
        Number(params.id)
      );

      setBilty(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Bilty");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        Loading...
      </div>
    );
  }

  if (!bilty) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        Bilty not found
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Edit Bilty
          </h1>

          <p className="text-gray-500">
            Update transport bilty details.
          </p>
        </div>

        <Link
          href="/dashboard/bilties"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

      </div>

      <BiltyForm
        bilty={bilty}
        isEdit
      />

    </div>
  );
}