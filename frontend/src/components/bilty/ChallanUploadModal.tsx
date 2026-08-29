"use client";

import { useState } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { uploadChallan } from "@/lib/challan";

interface Props {
  onClose: () => void;
  onSuccess: (challanId: number) => void;
  biltyType: "PAKKA" | "KACHHA";
}

export default function ChallanUploadModal({
  onClose,
  onSuccess,
  biltyType,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a challan PDF.");
      return;
    }

    try {
      setUploading(true);

      const response = await uploadChallan(
  file,
  biltyType
);

      const challanId = response?.data?.challan?.id;

      if (!challanId) {
        throw new Error(
          "Challan uploaded but ID was not received."
        );
      }

      toast.success("Challan uploaded successfully.");

      onSuccess(challanId);
    } catch (error: any) {
      console.error("Challan Upload Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to upload challan."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">
              Upload Challan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload a PDF challan to automatically detect bilties.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          <label
            htmlFor="challan-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50"
          >
            <Upload
              size={40}
              className="mb-4 text-blue-600"
            />

            <p className="font-medium">
              Click to select challan PDF
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Only PDF files are supported
            </p>

            <input
              id="challan-file"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Selected File */}
          {file && (
            <div className="mt-4 flex items-center justify-between rounded-lg border bg-gray-50 p-4">

              <div className="flex min-w-0 items-center gap-3">
                <FileText
                  size={24}
                  className="shrink-0 text-red-500"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-3 text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {uploading
              ? "Uploading..."
              : "Upload Challan"}
          </button>

        </div>
      </div>
    </div>
  );
}