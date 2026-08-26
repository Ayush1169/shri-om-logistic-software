"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BiltyForm from "@/components/bilty/BiltyForm";

export default function NewBiltyPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Create Bilty
          </h1>

          <p className="mt-1 text-gray-500">
            Add a new transport bilty.
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

      <BiltyForm />

    </div>
  );
}