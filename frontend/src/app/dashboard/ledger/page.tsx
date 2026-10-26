"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Truck,
  Wallet,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";


type Transaction = {
  id: number;
  date: string;
  type: string;
  particulars: string;
  referenceNumber: string;
  totalCharges?: number;
  debit: number;
  credit: number;
  difference?: number;
  balance: number | null;
  branchId: number;
  remarks?: string | null;
};

type LedgerData = {
  summary: {
    totalReceipts: number;
    totalCharges?: number;
    totalReceiptDifference?: number;
    totalPayments: number | null;
    netBalance: number | null;
    totalBilties: number;
    totalVehicles: number;
    receiptCount: number;
    note?: string;
  };
  transactions: Transaction[];
};


type Granularity = "Daily" | "Weekly" | "Monthly";

const money = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const dateValue = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const firstDay = () => `${today().slice(0, 7)}-01`;

const tabs = [
  "All",
  "Bilty Income",
  "Cash Receipts",
  "Payments",
  "Expenses",
  "Loading Charges",
  "Unloading Charges",
  "Other Charges",
];

/* ---------- UI-only styling maps ---------- */

const typeStyles: Record<string, string> = {
  OPENING_BALANCE: "bg-blue-100 text-blue-700",
  BILTY_INCOME: "bg-emerald-100 text-emerald-700",
  CASH_RECEIPT: "bg-emerald-100 text-emerald-700",
  PAYMENT: "bg-rose-100 text-rose-600",
  EXPENSE: "bg-amber-100 text-amber-700",
  LOADING_CHARGES: "bg-sky-100 text-sky-700",
  UNLOADING_CHARGES: "bg-violet-100 text-violet-700",
  OTHER_CHARGES: "bg-orange-100 text-orange-700",
};

const breakdownItems = [
  { type: "BILTY_INCOME", label: "Freight (Bilty)", color: "#2563eb" },
  { type: "LOADING_CHARGES", label: "Loading Charges", color: "#10b981" },
  { type: "UNLOADING_CHARGES", label: "Unloading Charges", color: "#f59e0b" },
  { type: "OTHER_CHARGES", label: "Other Charges", color: "#8b5cf6" },
];

/* ---------- small presentational components ---------- */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: {
    card: string;
    icon: string;
    title: string;
  };
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${tone.card}`}
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${tone.title}`}>{title}</p>
        <p className="mt-0.5 truncate text-[22px] font-bold leading-tight tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function IncomeExpenseChart({
  points,
}: {
  points: { label: string; receipts: number; payments: number }[];
}) {
  const W = 640;
  const H = 230;
  const pad = { l: 46, r: 18, t: 14, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const rawMax = Math.max(1, ...points.flatMap((p) => [p.receipts, p.payments]));
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / magnitude) * magnitude;

  const x = (i: number) =>
    pad.l + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;

  const line = (key: "receipts" | "payments") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p[key])}`).join(" ");

  const area = points.length
    ? `${line("receipts")} L${x(points.length - 1)},${pad.t + innerH} L${x(0)},${
        pad.t + innerH
      } Z`
    : "";

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(points.length / 6));

  if (!points.length) {
    return (
      <div className="flex h-[230px] items-center justify-center text-sm text-slate-400">
        No data for the selected range
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Income versus expense chart"
    >
      <defs>
        <linearGradient id="receiptsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={y(max * t)}
            y2={y(max * t)}
            stroke="#e2e8f0"
            strokeDasharray={t === 0 ? undefined : "3 4"}
          />
          <text
            x={pad.l - 8}
            y={y(max * t) + 4}
            textAnchor="end"
            className="fill-slate-500"
            fontSize="11"
          >
            {compact(max * t)}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#receiptsFill)" />
      <path
        d={line("payments")}
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={line("receipts")}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={`${p.label}-${i}`}>
          <circle cx={x(i)} cy={y(p.payments)} r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          <circle cx={x(i)} cy={y(p.receipts)} r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
          {i % labelStep === 0 && (
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="11"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Donut({
  segments,
  total,
}: {
  segments: { color: string; value: number }[];
  total: number;
}) {
  const r = 64;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="Income breakdown">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#f1f5f9" strokeWidth="26" />
      {total > 0 &&
        segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="26"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 90 90)"
            />
          );
          offset += len;
          return el;
        })}
      <text x="90" y="95" textAnchor="middle" fontSize="14" fontWeight="700" className="fill-slate-900">
        {total > 0 ? `₹ ${new Intl.NumberFormat("en-IN").format(total)}` : "—"}
      </text>
    </svg>
  );
}

export default function LedgerPage() {
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [granularity, setGranularity] = useState<Granularity>("Daily");

  async function loadLedger() {
    setLoading(true);
    try {
      const response = await api.get("/ledger/summary", {
        params: {
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        },
      });
      setData(response.data?.data ?? response.data);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        err.response?.data?.message ?? "Unable to load ledger data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLedger();
    // Initial load; filters are applied using the Apply Filters button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transactions = useMemo(() => {
    const all = data?.transactions ?? [];
    if (activeTab === "All") return all;

    const typeMap: Record<string, string[]> = {
      "Cash Receipts": ["CASH_RECEIPT"],
      "Bilty Income": ["BILTY_INCOME"],
      Payments: ["PAYMENT"],
      Expenses: ["EXPENSE"],
      "Loading Charges": ["LOADING_CHARGES"],
      "Unloading Charges": ["UNLOADING_CHARGES"],
      "Other Charges": ["OTHER_CHARGES"],
    };

    return all.filter((item) =>
      (typeMap[activeTab] ?? []).includes(item.type),
    );
  }, [data, activeTab]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const visibleTransactions = transactions.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  /* ---- UI-only derived data for charts / totals ---- */

  const chartPoints = useMemo(() => {
    const all = data?.transactions ?? [];
    const buckets = new Map<
      string,
      { sort: number; label: string; receipts: number; payments: number }
    >();

    for (const t of all) {
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) continue;

      let start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (granularity === "Weekly") {
        start = new Date(start);
        start.setDate(start.getDate() - start.getDay());
      } else if (granularity === "Monthly") {
        start = new Date(d.getFullYear(), d.getMonth(), 1);
      }

      const key = String(start.getTime());
      const label =
        granularity === "Monthly"
          ? start.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
          : start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

      const bucket = buckets.get(key) ?? {
        sort: start.getTime(),
        label,
        receipts: 0,
        payments: 0,
      };
      bucket.receipts += t.credit || 0;
      bucket.payments += t.debit || 0;
      buckets.set(key, bucket);
    }

    return Array.from(buckets.values()).sort((a, b) => a.sort - b.sort);
  }, [data, granularity]);

  const breakdown = useMemo(() => {
    const all = data?.transactions ?? [];
    const rows = breakdownItems.map((item) => ({
      ...item,
      value: all
        .filter((t) => t.type === item.type)
        .reduce((sum, t) => sum + (t.credit || 0), 0),
    }));
    const total = rows.reduce((sum, r) => sum + r.value, 0);
    return { rows, total };
  }, [data]);

  const pageTotals = useMemo(() => {
    const debit = visibleTransactions.reduce((s, t) => s + (t.debit || 0), 0);
    const credit = visibleTransactions.reduce((s, t) => s + (t.credit || 0), 0);
    const last = visibleTransactions[visibleTransactions.length - 1];
    return { debit, credit, balance: last ? last.balance : null };
  }, [visibleTransactions]);

  const pageNumbers = useMemo(() => {
    const current = Math.min(page, totalPages);
    const start = Math.max(1, Math.min(current - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  function changeTab(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }

  function exportCsv() {
    const rows = [
      ["Date", "Type", "Particulars", "Reference", "Debit", "Credit", "Balance"],
      ...transactions.map((t) => [
        dateValue(t.date),
        t.type,
        t.particulars,
        t.referenceNumber,
        String(t.debit),
        String(t.credit),
        t.balance === null ? "" : String(t.balance),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "shri-om-ledger.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Ledger exported.");
  }

  const summary = data?.summary;
  const showingFrom = transactions.length
    ? (Math.min(page, totalPages) - 1) * pageSize + 1
    : 0;
  const showingTo = Math.min(Math.min(page, totalPages) * pageSize, transactions.length);

  const dateInput =
    "w-[118px] bg-transparent text-[13px] text-slate-700 outline-none";

  return (
    <main className="min-h-full bg-slate-50 p-4 text-slate-800 sm:p-6 xl:p-7">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Ledger (Overall Accounts)
          </h1>
          <nav className="mt-1 text-[13px] text-slate-500">
            Home <span className="mx-1 text-slate-400">/</span> Accounts{" "}
            <span className="mx-1 text-slate-400">/</span>
            <span className="text-slate-700">Ledger</span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {(["Daily", "Weekly", "Monthly"] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`rounded-md px-4 py-2 text-[13px] font-medium transition ${
                  granularity === g
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10">
            <CalendarDays size={16} className="text-slate-500" />
            <input
              type="date"
              aria-label="From date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className={dateInput}
            />
            <span className="text-[13px] text-slate-500">to</span>
            <input
              type="date"
              aria-label="To date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className={dateInput}
            />
          </div>

          <button
            onClick={() => {
              setPage(1);
              void loadLedger();
            }}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setPage(1);
              setTimeout(() => void loadLedger(), 0);
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Clear Dates
          </button>
          <button
            onClick={() => void loadLedger()}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportCsv}
            disabled={!transactions.length}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-blue-700/25 transition hover:bg-blue-800 disabled:opacity-50"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <section className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Receipts"
          value={money(summary?.totalReceipts ?? 0)}
          subtitle={`${summary?.receiptCount ?? 0} recorded receipts`}
          icon={<ArrowDownLeft size={26} />}
          tone={{
            card: "border-emerald-200 bg-emerald-50",
            icon: "bg-emerald-200/70 text-emerald-700",
            title: "text-emerald-800",
          }}
        />

<StatCard
  title="Total Charges"
  value={money(summary?.totalCharges ?? null)}
  subtitle="Charges from recorded receipts"
  icon={<FileText size={26} />}
  tone={{
    card: "border-amber-200 bg-amber-50",
    icon: "bg-amber-200/70 text-amber-700",
    title: "text-amber-800",
  }}
/>

<StatCard
  title="Receipt Difference"
  value={money(summary?.totalReceiptDifference ?? null)}
  subtitle="Paid amount minus total charges"
  icon={<Wallet size={26} />}
  tone={{
    card: "border-cyan-200 bg-cyan-50",
    icon: "bg-cyan-200/70 text-cyan-700",
    title: "text-cyan-800",
  }}
/>

        <StatCard
          title="Total Payments"
          value={money(summary?.totalPayments ?? null)}
          subtitle="Payment records unavailable"
          icon={<ArrowUpRight size={26} />}
          tone={{
            card: "border-rose-200 bg-rose-50",
            icon: "bg-rose-200/70 text-rose-600",
            title: "text-rose-700",
          }}
        />
        <StatCard
          title="Net Profit / Balance"
          value={money(summary?.netBalance ?? null)}
          subtitle="Requires complete transaction data"
          icon={<Wallet size={26} />}
          tone={{
            card: "border-blue-200 bg-blue-50",
            icon: "bg-blue-200/70 text-blue-700",
            title: "text-blue-800",
          }}
        />
        <StatCard
          title="Total Bilties"
          value={summary ? String(summary.totalBilties) : "—"}
          subtitle="Within selected date range"
          icon={<FileText size={26} />}
          tone={{
            card: "border-amber-200 bg-amber-50",
            icon: "bg-amber-200/70 text-amber-700",
            title: "text-amber-800",
          }}
        />
        <StatCard
          title="Total Vehicles"
          value={summary ? String(summary.totalVehicles) : "—"}
          subtitle="Registered vehicles"
          icon={<Truck size={26} />}
          tone={{
            card: "border-violet-200 bg-violet-50",
            icon: "bg-violet-200/70 text-violet-700",
            title: "text-violet-800",
          }}
        />
      </section>

      {summary?.note && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Accounting data notice:</strong> {summary.note}
        </div>
      )}

      {/* Charts */}
      <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-slate-900">
              Income vs Expense
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-emerald-500" />
                Receipts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-red-500" />
                Payments
              </span>
            </div>
          </div>
          <IncomeExpenseChart points={chartPoints} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-[15px] font-bold text-slate-900">
            Income Breakdown
          </h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Donut
              total={breakdown.total}
              segments={breakdown.rows.map((r) => ({
                color: r.color,
                value: r.value,
              }))}
            />
            <ul className="w-full min-w-0 flex-1 space-y-3 text-[13px]">
              {breakdown.rows.map((row) => (
                <li key={row.type} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-slate-600">
                    {row.label}
                  </span>
                  <span className="tabular-nums text-slate-800">
                    ₹ {new Intl.NumberFormat("en-IN").format(row.value)}
                  </span>
                  <span className="w-9 text-right text-xs font-medium tabular-nums text-slate-400">
                    {breakdown.total > 0
                      ? `${Math.round((row.value / breakdown.total) * 100)}%`
                      : "0%"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="mb-3 overflow-x-auto">
        <div className="inline-flex min-w-full gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`whitespace-nowrap rounded-md px-5 py-2 text-[13px] font-medium transition ${
                activeTab === tab
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800">
                <th className="w-12 border-r border-slate-100 px-3 py-3 text-center font-semibold">#</th>
                <th className="border-r border-slate-100 px-4 py-3 text-center font-semibold">Date</th>
                <th className="border-r border-slate-100 px-4 py-3 text-center font-semibold">Type</th>
                <th className="border-r border-slate-100 px-4 py-3 font-semibold">Particulars</th>
                <th className="border-r border-slate-100 px-4 py-3 text-center font-semibold">Reference No.</th>
                <th className="border-r border-slate-100 px-4 py-3 text-center font-semibold">Debit (₹)</th>
                <th className="border-r border-slate-100 px-4 py-3 text-center font-semibold">Credit (₹)</th>
                <th className="border-r border-slate-100 px-4 py-3 text-center font-semibold">Balance (₹)</th>
                <th className="w-20 px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    Loading ledger transactions...
                  </td>
                </tr>
              ) : visibleTransactions.length ? (
                visibleTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-100 transition hover:bg-blue-50/40"
                  >
                    <td className="border-r border-slate-100 px-3 py-2.5 text-center text-slate-600">
                      {(Math.min(page, totalPages) - 1) * pageSize + index + 1}
                    </td>
                    <td className="whitespace-nowrap border-r border-slate-100 px-4 py-2.5 text-center text-slate-700">
                      {dateValue(transaction.date)}
                    </td>
                    <td className="border-r border-slate-100 px-4 py-2.5 text-center">
                      <span
                        className={`inline-block whitespace-nowrap rounded px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          typeStyles[transaction.type] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {transaction.type.replaceAll("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-2.5 text-slate-800">
                      {transaction.particulars}
                      {transaction.remarks && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                          {transaction.remarks}
                        </p>
                      )}
                    </td>
                    <td className="border-r border-slate-100 px-4 py-2.5 text-center text-xs text-slate-600">
                      {transaction.referenceNumber || "-"}
                    </td>
                    <td className="border-r border-slate-100 px-4 py-2.5 text-center tabular-nums text-rose-600">
                      {transaction.debit ? money(transaction.debit) : "-"}
                    </td>
                    <td className="border-r border-slate-100 px-4 py-2.5 text-center tabular-nums text-emerald-600">
                      {transaction.credit ? money(transaction.credit) : "-"}
                    </td>
                    <td className="border-r border-slate-100 px-4 py-2.5 text-center tabular-nums text-slate-800">
                      {money(transaction.balance)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Eye size={16} className="mx-auto text-slate-700" aria-label="View" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <FileText size={28} className="text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        No transactions found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try another date range or transaction type.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && visibleTransactions.length > 0 && (
                <tr className="bg-white font-bold">
                  <td colSpan={5} className="px-4 py-4 text-right text-slate-900">
                    Total
                  </td>
                  <td className="px-4 py-4 text-center tabular-nums text-rose-600">
                    {money(pageTotals.debit)}
                  </td>
                  <td className="px-4 py-4 text-center tabular-nums text-emerald-600">
                    {money(pageTotals.credit)}
                  </td>
                  <td className="px-4 py-4 text-center tabular-nums text-blue-700">
                    {money(pageTotals.balance)}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer / pagination */}
      <div className="mt-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <p className="text-[13px] text-slate-500">
          Showing {showingFrom} to {showingTo} of {transactions.length} entries
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Show
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
            >
              {[10, 15, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            per page
          </label>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 min-w-8 rounded-md border px-2 text-[13px] font-medium transition ${
                  n === Math.min(page, totalPages)
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}