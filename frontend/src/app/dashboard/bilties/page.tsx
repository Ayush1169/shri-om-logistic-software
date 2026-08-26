"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import BiltyTable from "@/components/bilty/BiltyTable";
import BiltyToolbar from "@/components/bilty/BiltyToolbar";
import ChallanUploadModal from "@/components/bilty/ChallanUploadModal";
import ChallanPreviewModal from "@/components/bilty/ChallanPreviewModal";

import {
  deleteBilty,
  getBilties,
} from "@/services/bilty.service";

import { Bilty } from "@/types/bilty";

export default function BiltyPage() {
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallanUploadModal, setShowChallanUploadModal] = useState(false);
  const [previewChallanId, setPreviewChallanId] =
  useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  /**
   * Load Data
   */
  const loadBilties = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getBilties(
        page,
        search
      );

      setBilties(res.bilties);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load bilties"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  /**
   * Initial Load
   */
  useEffect(() => {
    loadBilties();
  }, [loadBilties]);

  /**
   * Search
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadBilties();
    }, 400);

    return () =>
      clearTimeout(timer);
  }, [search]);

  /**
   * Delete
   */
  const handleDelete = async (
    id: number
  ) => {
    const ok = window.confirm(
      "Are you sure you want to delete this Bilty?"
    );

    if (!ok) return;

    try {
      await deleteBilty(id);

      toast.success(
        "Bilty deleted successfully"
      );

      loadBilties();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to delete Bilty"
      );
    }
  };
    return (
    <div className="space-y-6">

      {/* Toolbar */}
     <BiltyToolbar
  search={search}
  setSearch={setSearch}
  onUploadChallan={() => setShowChallanUploadModal(true)}
/>

   {showChallanUploadModal && (
  <ChallanUploadModal
    onClose={() =>
      setShowChallanUploadModal(false)
    }
    onSuccess={(challanId) => {
      console.log(
        "Uploaded Challan ID:",
        challanId
      );

      // Upload modal close
      setShowChallanUploadModal(false);

      // Preview modal open
      setPreviewChallanId(challanId);
    }}
  />
)}

{previewChallanId !== null && (
  <ChallanPreviewModal
    challanId={previewChallanId}
    onClose={() =>
      setPreviewChallanId(null)
    }
    onSuccess={() => {
      // Preview modal close
      setPreviewChallanId(null);

      // Actual bilties import hone ke baad table refresh
      loadBilties();
    }}
  />
)}

      {/* Table */}
      <BiltyTable
        bilties={bilties}
        loading={loading}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border bg-white px-6 py-4">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage((prev) => prev - 1)
            }
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((pageNo) => (
              <button
                key={pageNo}
                onClick={() =>
                  setPage(pageNo)
                }
                className={`h-10 w-10 rounded-lg border text-sm font-medium transition ${
                  page === pageNo
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {pageNo}
              </button>
            ))}

          </div>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((prev) => prev + 1)
            }
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}
            {/* Page Info */}
      {!loading && (
        <div className="text-center text-sm text-gray-500">
          Showing page{" "}
          <span className="font-semibold">
            {page}
          </span>{" "}
          of{" "}
          <span className="font-semibold">
            {totalPages}
          </span>
        </div>
      )}

    </div>
  );
}