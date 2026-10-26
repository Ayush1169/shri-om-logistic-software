
"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";

type BiltyReport = {
  id: number;
  biltyNumber: string;
  date: string;
  loadingDate: string | null;
  vehicleNumber: string;
  branchId: number;
  branchName: string;
  freight: number;
  unloadingCharges: number;
  totalAmount: number;
  paymentType: "PAID" | "TO_PAY" | "BILLING";
  status: "BOOKED" | "LOADED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
};

type ReportResponse = {
  success: boolean;
  data: BiltyReport[];
  totals: {
    freight: number;
    unloadingCharges: number;
    totalAmount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const statusOptions = [
  "BOOKED",
  "LOADED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const paymentOptions = ["PAID", "TO_PAY", "BILLING"];

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatDate = (value: string | null) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export default function ReportsPage() {
  const [rows, setRows] = useState<BiltyReport[]>([]);
  const [totals, setTotals] = useState({
    freight: 0,
    unloadingCharges: 0,
    totalAmount: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [branchId, setBranchId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = useCallback(
    async (requestedPage = page) => {
      setLoading(true);
      setError("");

      try {
        const params: Record<string, string | number> = {
          page: requestedPage,
          limit,
        };

        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        if (branchId) params.branchId = branchId;
        if (paymentType) params.paymentType = paymentType;
        if (status) params.status = status;

        const response = await api.get<ReportResponse>(
          "/reports/bilties",
          { params }
        );

        const result = response.data;

        if (!result.success) {
          throw new Error("Could not load the bilty report.");
        }

        let reportRows = result.data || [];

        // Vehicle number filtering is performed on the returned report rows.
        // Server-side vehicle filtering will be added separately if needed.
        if (vehicleNo.trim()) {
          const search = vehicleNo.trim().toLowerCase();
          reportRows = reportRows.filter((row) =>
            row.vehicleNumber.toLowerCase().includes(search)
          );
        }

        setRows(reportRows);
        setTotals(result.totals || {
          freight: 0,
          unloadingCharges: 0,
          totalAmount: 0,
        });
        setTotal(result.pagination?.total || 0);
        setTotalPages(result.pagination?.totalPages || 0);
      } catch (err: unknown) {
        console.error("Bilty report error:", err);
        setRows([]);
        setTotals({ freight: 0, unloadingCharges: 0, totalAmount: 0 });
        setTotal(0);
        setTotalPages(0);
        setError(
          "Report load nahi ho paayi. Login/token aur backend API check karo."
        );
      } finally {
        setLoading(false);
      }
    },
    [page, limit, fromDate, toDate, branchId, paymentType, status, vehicleNo]
  );

  useEffect(() => {
    void fetchReport(page);
  }, [fetchReport, page]);

  const handleShow = () => {
    setPage(1);
    void fetchReport(1);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setBranchId("");
    setVehicleNo("");
    setPaymentType("");
    setStatus("");
    setPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCsv = () => {
    const headers = [
      "Bilty Number",
      "Date",
      "Loading Date",
      "Vehicle Number",
      "Branch",
      "Freight",
      "Unloading Charges",
      "Total Amount",
      "Payment Type",
      "Status",
    ];

    const csvRows = rows.map((row) => [
      row.biltyNumber,
      formatDate(row.date),
      formatDate(row.loadingDate),
      row.vehicleNumber,
      row.branchName,
      row.freight,
      row.unloadingCharges,
      row.totalAmount,
      row.paymentType,
      row.status,
    ]);

    const csv = [headers, ...csvRows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bilty-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-800 md:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-700">
            SHRI OM LOGISTICS
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, review and export bilty records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Print
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Bilty Report Filters</h2>
          <span className="text-xs text-slate-500">All fields optional</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">
            From Date
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="text-sm font-medium">
            To Date
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="text-sm font-medium">
            Branch ID
            <input
              type="number"
              min="1"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder="e.g. 1"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="text-sm font-medium">
            Vehicle Number
            <input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              placeholder="e.g. HR74C4753"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="text-sm font-medium">
            Payment Type
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All payment types</option>
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Bilty Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handleShow}
            disabled={loading}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Show Report"}
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Freight</p>
          <p className="mt-2 text-2xl font-bold">{money(totals.freight)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unloading Charges</p>
          <p className="mt-2 text-2xl font-bold">
            {money(totals.unloadingCharges)}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-700">Total Amount</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {money(totals.totalAmount)}
          </p>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Bilty Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              {total} matching records
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 print:hidden">
            Rows per page
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {[25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">S.No.</th>
                <th className="px-4 py-3">Bilty No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Loading Date</th>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3 text-right">Freight</th>
                <th className="px-4 py-3 text-right">Unloading</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    Loading bilty report...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    No bilty records found for these filters.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {row.biltyNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(row.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(row.loadingDate)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {row.vehicleNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {money(row.freight)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {money(row.unloadingCharges)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {money(row.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                        {row.paymentType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {row.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {!loading && rows.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <tr>
                  <td colSpan={5} className="px-4 py-3">
                    Totals for matching records
                  </td>
                  <td className="px-4 py-3 text-right">{money(totals.freight)}</td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.unloadingCharges)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.totalAmount)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            Page {page} of {Math.max(totalPages, 1)}
          </p>

          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPage((current) =>
                  totalPages ? Math.min(totalPages, current + 1) : current + 1
                )
              }
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
