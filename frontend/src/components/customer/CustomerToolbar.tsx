import Link from "next/link";
export default function CustomerToolbar() {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <input
        type="text"
        placeholder="Search Customer..."
        className="w-full rounded-lg border px-4 py-2 md:w-80"
      />

     <Link
  href="/dashboard/customer/add"
  className="rounded-lg bg-blue-600 px-5 py-2 text-white text-center"
>
  + Add Customer
</Link>
    </div>
  );
}