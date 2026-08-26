"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Props {
  id: number;
  onDelete: (id: number) => void;
}

export default function BiltyActionMenu({
  id,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {/* View */}
      <Link
        href={`/dashboard/bilties/${id}`}
        className="rounded-md border p-2 hover:bg-gray-100 transition"
      >
        <Eye className="h-4 w-4 text-blue-600" />
      </Link>

      {/* Edit */}
      <Link
        href={`/dashboard/bilties/${id}/edit`}
        className="rounded-md border p-2 hover:bg-gray-100 transition"
      >
        <Pencil className="h-4 w-4 text-green-600" />
      </Link>

      {/* Delete */}
      <button
        onClick={() => onDelete(id)}
        className="rounded-md border p-2 hover:bg-red-50 transition"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </button>
    </div>
  );
}