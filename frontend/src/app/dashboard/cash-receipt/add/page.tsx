"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Printer,
  RotateCcw,
  Save,
  Search,
  Truck,
  Wallet,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

type Bilty = {
  id: number;
  biltyNumber?: string;
  branchId?: number;
  consigneeId?: number | null;
  consigneeName?: string | null;
  consignee?: { name?: string } | string | null;
  pickupAddress?: string | null;
  fromLocation?: string | null;
  packageCount?: number | null;
  freight?: number | null;
};

type ReceiptForm = {
  receiptDate: string;
  biltyId: string;
  consigneeName: string;
  packageCount: string;
  fromLocation: string;
  freight: string;
  stationCharges: string;
  unloadingCharges: string;
  godownCharges: string;
  refund: string;
  paidAmount: string;
  remarks: string;
};

type SavedReceipt = {
  id?: number;
  receiptNumber?: string;
  totalAmount?: number;
  paidAmount?: number;
};

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function createForm(): ReceiptForm {
  return {
    receiptDate: today(),
    biltyId: "",
    consigneeName: "",
    packageCount: "",
    fromLocation: "",
    freight: "0",
    stationCharges: "0",
    unloadingCharges: "0",
    godownCharges: "0",
    refund: "0",
    paidAmount: "",
    remarks: "",
  };
}

function numberValue(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function extractBilties(data: unknown): Bilty[] {
  const root = data as any;
  const body = root?.data ?? root;
  const result: Bilty[] = [];

  if (Array.isArray(body)) result.push(...body);
  if (Array.isArray(body?.bilties)) result.push(...body.bilties);

  if (Array.isArray(body?.groups)) {
    for (const group of body.groups) {
      if (Array.isArray(group?.bilties)) {
        result.push(...group.bilties);
      }
    }
  }

  return Array.from(
    new Map(
      result
        .filter((item) => item && item.id != null)
        .map((item) => [item.id, item]),
    ).values(),
  );
}

/* ---------- shared style tokens ---------- */

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-100";

const labelClass = "block text-[13px] font-medium text-slate-600";

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <div className="flex items-center justify-between pl-1">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon}
      </div>
      <p className="mt-2.5 truncate pl-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 truncate pl-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export default function AddCashReceiptPage() {
  const [form, setForm] = useState<ReceiptForm>(createForm);
  const [bilties, setBilties] = useState<Bilty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [biltySearch, setBiltySearch] = useState("");
  const [savedReceipt, setSavedReceipt] = useState<SavedReceipt | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBilties() {
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          api.get("/bilties", {
            params: { page: 1, limit: 1000, biltyType: "PAKKA" },
          }),
          api.get("/bilties", {
            params: { page: 1, limit: 1000, biltyType: "KACHHA" },
          }),
        ]);

        const all: Bilty[] = [];

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            all.push(...extractBilties(result.value.data));
          }
        });

        const unique = Array.from(
          new Map(all.map((item) => [item.id, item])).values(),
        );

        if (!cancelled) {
          setBilties(unique);
          if (unique.length === 0) {
            toast.error("No bilties found. Check the Bilty API response.");
          }
        }
      } catch {
        if (!cancelled) toast.error("Unable to load bilties.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBilties();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBilty = useMemo(
    () => bilties.find((item) => String(item.id) === form.biltyId),
    [bilties, form.biltyId],
  );

  const filteredBilties = useMemo(() => {
    const query = biltySearch.trim().toLowerCase();
    if (!query) return bilties.slice(0, 100);

    return bilties
      .filter((bilty) =>
        `${bilty.biltyNumber ?? ""} ${bilty.consigneeName ?? ""} ${bilty.id}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 100);
  }, [bilties, biltySearch]);

  const totalAmount = useMemo(
    () =>
      numberValue(form.freight) +
      numberValue(form.stationCharges) +
      numberValue(form.unloadingCharges) +
      numberValue(form.godownCharges) -
      numberValue(form.refund),
    [form],
  );

  function updateField(field: keyof ReceiptForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSavedReceipt(null);
  }

  function selectBilty(id: string) {
    const bilty = bilties.find((item) => String(item.id) === id);

    const consignee =
      typeof bilty?.consignee === "object" && bilty.consignee
        ? bilty.consignee.name ?? ""
        : typeof bilty?.consignee === "string"
          ? bilty.consignee
          : "";

    setForm((previous) => ({
      ...previous,
      biltyId: id,
      consigneeName: bilty?.consigneeName || consignee,
      packageCount: String(bilty?.packageCount ?? ""),
      fromLocation: bilty?.fromLocation || bilty?.pickupAddress || "",
      freight: String(bilty?.freight ?? 0),
    }));

    setSavedReceipt(null);
  }

  async function saveReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBilty) {
      toast.error("Please select a GR / Bilty.");
      return;
    }

    if (!selectedBilty.branchId) {
      toast.error("Selected bilty does not have a branch assigned.");
      return;
    }

    if (totalAmount < 0) {
      toast.error("Total amount cannot be negative.");
      return;
    }

    if (form.paidAmount.trim() === "" || numberValue(form.paidAmount) < 0) {
      toast.error("Please enter a valid paid amount.");
      return;
    }

    const payload = {
      receiptDate: form.receiptDate,
      biltyId: Number(form.biltyId),
      branchId: Number(selectedBilty.branchId),
      consigneeId: selectedBilty.consigneeId ?? null,
      consigneeName: form.consigneeName.trim(),
      packageCount: numberValue(form.packageCount),
      fromLocation: form.fromLocation.trim(),
      freight: numberValue(form.freight),
      stationCharges: numberValue(form.stationCharges),
      unloadingCharges: numberValue(form.unloadingCharges),
      godownCharges: numberValue(form.godownCharges),
      refund: numberValue(form.refund),
      totalAmount,
      paidAmount: numberValue(form.paidAmount),
      remarks: form.remarks.trim(),
    };

    setSaving(true);

    try {
      const response = await api.post("/cash-receipts", payload);
      const result = response.data?.data ?? response.data;

      setSavedReceipt({
        id: result.id,
        receiptNumber: result.receiptNumber,
        totalAmount: result.totalAmount ?? totalAmount,
        paidAmount: result.paidAmount ?? numberValue(form.paidAmount),
      });

      toast.success(
        `Receipt ${result.receiptNumber ?? ""} saved successfully.`,
      );
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        err.response?.data?.message ?? "Failed to save cash receipt.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(createForm());
    setBiltySearch("");
    setSavedReceipt(null);
  }

  function printReceipt() {
    if (!selectedBilty) {
      toast.error("Select a bilty before printing.");
      return;
    }
    window.print();
  }

  const difference = totalAmount - numberValue(form.paidAmount);

  const chargeRows = [
    ["freight", "Freight"],
    ["stationCharges", "Station Charges"],
    ["unloadingCharges", "Unloading Charges"],
    ["godownCharges", "Godown Charges"],
    ["refund", "Refund / Deduction"],
  ] as const;

  const memoRows = [
    ["Freight", form.freight],
    ["Stv. Charges", form.stationCharges],
    ["Unloading Charges", form.unloadingCharges],
    ["God. Charges", form.godownCharges],
    ["Refund", form.refund],
  ] as const;

  return (
    <main className="min-h-full bg-slate-100/70 p-4 text-slate-800 sm:p-6 xl:p-8 print:bg-white print:p-0">
      {/* Page heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/25">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Cash Receipt
              </h1>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                Accounts
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Create, review and print transport payment receipts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            onClick={printReceipt}
            disabled={!selectedBilty}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 print:hidden">
        <StatCard
          label="Total Charges"
          value={money(totalAmount)}
          hint="Calculated automatically"
          icon={<Wallet size={17} className="text-blue-600" />}
          accent="bg-blue-600"
        />
        <StatCard
          label="Paid Amount"
          value={money(numberValue(form.paidAmount))}
          hint="Amount received"
          icon={<CheckCircle2 size={17} className="text-emerald-600" />}
          accent="bg-emerald-500"
        />
        <StatCard
          label="Receipt Status"
          value={savedReceipt ? "Saved" : "Draft"}
          hint={savedReceipt?.receiptNumber ?? "Not saved yet"}
          icon={<FileText size={17} className="text-violet-600" />}
          accent={savedReceipt ? "bg-emerald-500" : "bg-amber-400"}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Receipt form */}
        <form
          onSubmit={saveReceipt}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:hidden"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Receipt Details
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Enter the GR and payment details below.
              </p>
            </div>
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              New receipt
            </span>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* Transport info */}
            <section>
              <SectionHeading
                icon={<Truck size={16} />}
                title="Transport Information"
                description="Select the GR and verify the consignee details."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Receipt Date <span className="text-red-500">*</span>
                  <input
                    type="date"
                    required
                    value={form.receiptDate}
                    onChange={(e) => updateField("receiptDate", e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  GR No. / Bilty <span className="text-red-500">*</span>
                  <select
                    required
                    value={form.biltyId}
                    disabled={loading}
                    onChange={(e) => selectBilty(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">
                      {loading ? "Loading bilties..." : "Select GR number"}
                    </option>
                    {filteredBilties.map((bilty) => (
                      <option key={bilty.id} value={bilty.id}>
                        {bilty.biltyNumber ?? `Bilty ${bilty.id}`}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-600/10">
                    <Search size={14} className="shrink-0 text-slate-400" />
                    <input
                      value={biltySearch}
                      onChange={(e) => setBiltySearch(e.target.value)}
                      placeholder="Search GR / consignee..."
                      className="w-full border-0 bg-transparent py-2 text-xs outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label className={labelClass}>
                  Package / Bags
                  <input
                    type="number"
                    min="0"
                    value={form.packageCount}
                    onChange={(e) =>
                      updateField("packageCount", e.target.value)
                    }
                    placeholder="0"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  From / Station
                  <input
                    value={form.fromLocation}
                    onChange={(e) =>
                      updateField("fromLocation", e.target.value)
                    }
                    placeholder="Enter origin station"
                    className={inputClass}
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  Consignee Name
                  <input
                    value={form.consigneeName}
                    onChange={(e) =>
                      updateField("consigneeName", e.target.value)
                    }
                    placeholder="Enter consignee name"
                    className={inputClass}
                  />
                </label>
              </div>

              {selectedBilty && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                  <Truck size={17} className="mt-0.5 shrink-0 text-blue-700" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-900">
                      GR {selectedBilty.biltyNumber ?? selectedBilty.id} selected
                    </p>
                    <p className="mt-1 break-words text-xs text-blue-800/80">
                      Branch ID: {selectedBilty.branchId ?? "Not assigned"}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Charges */}
            <section className="border-t border-slate-100 pt-6">
              <SectionHeading
                icon={<Wallet size={16} />}
                title="Freight & Charges"
                description="Enter the charges applicable to this consignment."
              />

              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                {chargeRows.map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center justify-between gap-4 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 transition focus-within:bg-blue-50/40"
                  >
                    {label}
                    <div className="flex w-40 items-center overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10">
                      <span className="border-r border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="w-full min-w-0 bg-transparent px-2.5 py-2 text-right text-sm tabular-nums text-slate-800 outline-none"
                      />
                    </div>
                  </label>
                ))}

                <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Total Receipt Amount
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Charges minus refund
                    </p>
                  </div>
                  <p className="text-xl font-bold tabular-nums text-white">
                    {money(totalAmount)}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="border-t border-slate-100 pt-6">
              <SectionHeading
                icon={<CheckCircle2 size={16} />}
                title="Payment & Remarks"
                description="Record the amount received and any notes."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Paid Amount (₹) <span className="text-red-500">*</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.paidAmount}
                    onChange={(e) => updateField("paidAmount", e.target.value)}
                    placeholder="Enter amount received"
                    className={inputClass}
                  />
                </label>

                <div
                  className={`rounded-xl border p-3 ${
                    difference === 0
                      ? "border-emerald-200 bg-emerald-50"
                      : difference > 0
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-600">
                    Difference (Total − Paid)
                  </p>
                  <p className="mt-1.5 text-lg font-bold tabular-nums text-slate-800">
                    {money(difference)}
                  </p>
                </div>

                <label className={`${labelClass} sm:col-span-2`}>
                  Payment Remarks
                  <textarea
                    rows={3}
                    value={form.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    placeholder="Enter payment notes or special instructions..."
                    className={`${inputClass} resize-y`}
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <p className="text-xs text-slate-500">
              <span className="text-red-500">*</span> Required fields
            </p>
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-700/25 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving Receipt..." : "Save Cash Receipt"}
            </button>
          </div>
        </form>

        {/* Memo preview */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6 print:static print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 print:hidden">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cash Memo Preview
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Live preview of the printed receipt.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>

          <div className="bg-slate-200/60 p-3 sm:p-5 print:bg-white print:p-0">
            <article
              id="cash-receipt-paper"
              className="mx-auto min-h-[600px] w-full max-w-[650px] bg-white p-3 text-[11px] leading-relaxed text-black shadow-md ring-1 ring-slate-300 sm:p-4 print:min-h-0 print:max-w-none print:p-0 print:shadow-none print:ring-0"
            >
              {/* inner frame */}
              <div className="border border-dashed border-slate-500 p-4 sm:p-6 print:border-black print:p-4">
                <header className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3 pb-4 print:grid-cols-[60px_minmax(0,1fr)_100px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black text-base font-black print:h-14 print:w-14">
                    SO
                  </div>

                  <div className="text-center">
                    <h2 className="text-xl font-black leading-tight tracking-wide sm:text-2xl print:text-2xl">
                      SHRI OM LOGISTIC
                    </h2>
                    <p className="mt-1 text-[11px] font-semibold print:text-xs">
                      Transport ID: 22AOXPU3731M1Z8
                    </p>
                    <p className="text-[11px] print:text-xs">
                      Mob. 9109288364, 8962857699
                    </p>
                    <span className="mt-2 inline-block text-xs font-extrabold tracking-[0.12em] underline decoration-2 underline-offset-4 print:text-sm">
                      CASH RECEIPT
                    </span>
                  </div>

                  <div className="hidden text-right print:flex print:flex-col">
                    <span className="text-[9px]">Receipt No.</span>
                    <strong className="text-xs">
                      {savedReceipt?.receiptNumber ?? "DRAFT"}
                    </strong>
                  </div>
                </header>

                {/* Meta fields with dotted fill lines */}
                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 text-[11px] sm:grid-cols-2 print:grid-cols-2 print:text-xs">
                  <div className="flex items-end gap-2 border-b border-dotted border-slate-500 pb-1">
                    <span className="shrink-0 font-bold">Date</span>
                    <span className="min-w-0 flex-1 break-words font-medium">
                      {form.receiptDate || "—"}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 border-b border-dotted border-slate-500 pb-1">
                    <span className="shrink-0 font-bold">G.R. No.</span>
                    <span className="min-w-0 flex-1 break-words font-medium">
                      {selectedBilty?.biltyNumber ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 border-b border-dotted border-slate-500 pb-1">
                    <span className="shrink-0 font-bold">Package</span>
                    <span className="min-w-0 flex-1 font-medium">
                      {form.packageCount || "—"}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 border-b border-dotted border-slate-500 pb-1">
                    <span className="shrink-0 font-bold">From</span>
                    <span className="min-w-0 flex-1 break-words font-medium">
                      {form.fromLocation || "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-end gap-2 border-b border-dotted border-slate-500 pb-1 text-[11px] print:text-xs">
                  <strong className="shrink-0">Consignee</strong>
                  <span className="min-w-0 flex-1 break-words font-medium">
                    {form.consigneeName || "—"}
                  </span>
                </div>

                {/* Particulars | Amount | Remarks */}
                <table className="mt-5 w-full border-collapse border-t-2 border-black text-[11px] print:text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left font-bold">
                        Particulars
                      </th>
                      <th className="w-[28%] border-x border-black px-2 py-2 text-right font-bold">
                        Rs.
                      </th>
                      <th className="w-[26%] px-2 py-2 text-left font-bold">
                        P. Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {memoRows.map(([label, value], index) => (
                      <tr key={label}>
                        <td className="border-b border-dotted border-slate-400 px-2 py-2">
                          {label}
                        </td>
                        <td className="border-x border-b border-dotted border-black border-b-slate-400 px-2 py-2 text-right tabular-nums">
                          {money(numberValue(value))}
                        </td>
                        {index === 0 && (
                          <td
                            rowSpan={memoRows.length}
                            className="whitespace-pre-wrap break-words px-2 py-2 align-top"
                          >
                            {form.remarks || "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="border-t border-black font-extrabold">
                      <td className="px-2 py-2.5">Total</td>
                      <td className="border-x border-black px-2 py-2.5 text-right tabular-nums">
                        {money(totalAmount)}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">
                        {money(numberValue(form.paidAmount))}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-sm border-2 border-black px-3 py-2.5">
                  <span className="font-bold">Paid Amount</span>
                  <strong className="text-base tabular-nums">
                    {money(numberValue(form.paidAmount))}
                  </strong>
                </div>

                <p className="mt-5 text-[10px] font-semibold leading-relaxed print:text-xs">
                  Note : Company will not be Responsible for any Claim after GR
                  will be Released.
                </p>

                <footer className="mt-12 flex justify-between gap-8 text-center text-[10px] print:mt-20 print:text-xs">
                  <div className="w-40 border-t border-black pt-2">
                    Receiver&apos;s Signature
                  </div>
                  <div className="w-40 border-t border-black pt-2">
                    Authorised Signature
                  </div>
                </footer>

                <div className="mt-6 hidden border-t border-dashed border-slate-400 pt-2 text-center text-[9px] print:block">
                  {savedReceipt?.receiptNumber
                    ? `Receipt No: ${savedReceipt.receiptNumber}`
                    : "Receipt preview"}
                </div>
              </div>
            </article>
          </div>

          {savedReceipt && (
            <div className="flex items-start gap-3 border-t border-emerald-100 bg-emerald-50 px-5 py-4 print:hidden">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Receipt saved successfully
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Receipt number: {savedReceipt.receiptNumber ?? "Saved"}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row print:hidden">
            <button
              type="button"
              onClick={printReceipt}
              disabled={!selectedBilty}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={16} />
              Print Memo
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}