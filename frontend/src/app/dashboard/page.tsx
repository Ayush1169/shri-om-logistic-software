"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Truck,
  UserRound,
  FileText,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ChevronRight,
  Activity,
  CalendarDays,
  ReceiptText,
  Inbox,
  BarChart3,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

type DashboardStats = {
  customers: number | null;
  vehicles: number | null;
  drivers: number | null;
  bilties: number | null;
  receipts: number | null;
  receiptCount: number | null;
};

type RecentItem = {
  id: number;
  date: string;
  title: string;
  reference: string;
  amount: number | null;
  type: string;
};

const money = (value: number | null) =>
  value === null
    ? "Unavailable"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ------------------------------------------------------------------ */
/* UI helpers (display only)                                           */
/* ------------------------------------------------------------------ */

const compactMoney = (value: number) =>
  "₹" +
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">
              {title}
            </h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  glow,
  loading,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  loading: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_28px_-14px_rgba(15,23,42,0.18)]">
      <Icon
        size={92}
        strokeWidth={1.25}
        className="pointer-events-none absolute -bottom-5 -right-5 text-slate-100 transition group-hover:text-slate-200/80"
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${gradient} ${glow}`}
        >
          <Icon size={20} />
        </div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
      </div>

      {loading ? (
        <div className="relative mt-5 space-y-2.5" aria-hidden="true">
          <div className="h-8 w-24 animate-pulse rounded-md bg-slate-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      ) : (
        <div className="relative mt-5">
          <p className="break-words text-[1.9rem] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
      )}
    </div>
  );
}

/* Area chart: amount per receipt (oldest → newest) */
function ReceiptsChart({
  items,
  loading,
}: {
  items: RecentItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="p-5" aria-hidden="true">
        <div className="h-[290px] animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  const data = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[340px] flex-col items-center justify-center px-5 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <BarChart3 size={20} />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">
          No receipt data to chart
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Add a cash receipt and it will show up here.
        </p>
      </div>
    );
  }

  const vals = data.map((d) => d.amount ?? 0);
  const total = vals.reduce((s, v) => s + v, 0);
  const highest = Math.max(...vals);
  const average = total / vals.length;

  const W = 640;
  const H = 250;
  const pl = 58;
  const pr = 18;
  const pt = 18;
  const pb = 34;
  const iw = W - pl - pr;
  const ih = H - pt - pb;

  const rawMax = Math.max(...vals, 1);
  const step = Math.pow(10, Math.floor(Math.log10(rawMax))) / 2;
  const max = Math.ceil(rawMax / step) * step;

  const x = (i: number) =>
    data.length === 1 ? pl + iw / 2 : pl + (i * iw) / (data.length - 1);
  const y = (v: number) => pt + ih - (v / max) * ih;

  let line = `M ${x(0)} ${y(vals[0])}`;
  for (let i = 1; i < data.length; i++) {
    const cx = (x(i - 1) + x(i)) / 2;
    line += ` C ${cx} ${y(vals[i - 1])} ${cx} ${y(vals[i])} ${x(i)} ${y(vals[i])}`;
  }
  const area = `${line} L ${x(data.length - 1)} ${pt + ih} L ${x(0)} ${pt + ih} Z`;

  return (
    <div className="p-5">
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Loaded total", value: money(total) },
          { label: "Highest receipt", value: money(highest) },
          { label: "Average", value: money(Math.round(average)) },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3"
          >
            <p className="text-[11px] font-medium text-slate-500">{m.label}</p>
            <p className="mt-1 truncate text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Area chart of recent cash receipt amounts"
      >
        <defs>
          <linearGradient id="receiptFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="receiptStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((t) => {
          const v = (max / 4) * t;
          return (
            <g key={t}>
              <line
                x1={pl}
                x2={W - pr}
                y1={y(v)}
                y2={y(v)}
                stroke="#e2e8f0"
                strokeDasharray={t === 0 ? "0" : "4 5"}
              />
              <text
                x={pl - 10}
                y={y(v) + 4}
                textAnchor="end"
                className="fill-slate-400"
                fontSize="11"
              >
                {compactMoney(v)}
              </text>
            </g>
          );
        })}

        {data.length > 1 && <path d={area} fill="url(#receiptFill)" />}
        {data.length > 1 && (
          <path
            d={line}
            fill="none"
            stroke="url(#receiptStroke)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {data.map((d, i) => (
          <g key={d.id}>
            <circle cx={x(i)} cy={y(vals[i])} r="9" fill="#2563eb" opacity="0.12" />
            <circle
              cx={x(i)}
              cy={y(vals[i])}
              r="5"
              fill="#fff"
              stroke="#2563eb"
              strokeWidth="2.5"
            >
              <title>{`${d.reference} · ${money(vals[i])} · ${dateLabel(d.date)}`}</title>
            </circle>
            <text
              x={x(i)}
              y={H - 10}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="11"
            >
              {shortDate(d.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* Donut chart: how records are split across modules */
function RecordsDonut({
  segments,
  loading,
}: {
  segments: { label: string; value: number | null; color: string }[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="p-5" aria-hidden="true">
        <div className="mx-auto h-44 w-44 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const total = segments.reduce((s, seg) => s + (seg.value ?? 0), 0);
  const r = 66;
  const C = 2 * Math.PI * r;
  const gap = segments.filter((s) => (s.value ?? 0) > 0).length > 1 ? 3 : 0;
  let acc = 0;

  return (
    <div className="p-5">
      <div className="relative mx-auto h-48 w-48">
        <svg
          viewBox="0 0 160 160"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="Donut chart of records by module"
        >
          <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
          {total > 0 &&
            segments.map((seg) => {
              const v = seg.value ?? 0;
              if (v <= 0) return null;
              const len = (v / total) * C;
              const el = (
                <circle
                  key={seg.label}
                  cx="80"
                  cy="80"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={`${Math.max(len - gap, 0.5)} ${C - Math.max(len - gap, 0.5)}`}
                  strokeDashoffset={-acc}
                >
                  <title>{`${seg.label}: ${v.toLocaleString("en-IN")}`}</title>
                </circle>
              );
              acc += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {total.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500">Total records</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {segments.map((seg) => {
          const v = seg.value;
          const pct = v !== null && total > 0 ? Math.round((v / total) * 100) : 0;
          return (
            <li key={seg.label} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-slate-600">{seg.label}</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {v === null ? "—" : v.toLocaleString("en-IN")}
              </span>
              <span className="w-10 text-right text-xs tabular-nums text-slate-400">
                {v === null ? "" : `${pct}%`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    customers: null,
    vehicles: null,
    drivers: null,
    bilties: null,
    receipts: null,
    receiptCount: null,
  });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadDashboard() {
    setLoading(true);

    const results = await Promise.allSettled([
      api.get("/customers", { params: { page: 1, limit: 1 } }),
      api.get("/vehicles", { params: { page: 1, limit: 1 } }),
      api.get("/drivers", { params: { page: 1, limit: 1 } }),
      api.get("/bilties", { params: { page: 1, limit: 1 } }),
      api.get("/cash-receipts", { params: { page: 1, limit: 5 } }),
    ]);

    const readCount = (result: PromiseSettledResult<any>) => {
      if (result.status !== "fulfilled") return null;

      const body = result.value.data;
      const count =
        body?.pagination?.total ??
        body?.total ??
        body?.data?.pagination?.total ??
        body?.data?.total;

      return typeof count === "number" ? count : null;
    };

    const customerCount = readCount(results[0]);
    const vehicleCount = readCount(results[1]);
    const driverCount = readCount(results[2]);
    const biltyCount = readCount(results[3]);

    const receiptResult = results[4];
    let receiptTotal: number | null = null;
    let receiptCount: number | null = null;
    let recentItems: RecentItem[] = [];

    if (receiptResult.status === "fulfilled") {
      const body = receiptResult.value.data;
      const receipts = body?.data?.data ?? body?.data ?? [];

      if (Array.isArray(receipts)) {
        receiptCount =
          body?.pagination?.total ??
          body?.data?.pagination?.total ??
          null;

        receiptTotal = receipts.reduce(
          (sum: number, item: any) =>
            sum + Number(item.paidAmount ?? 0),
          0,
        );

        recentItems = receipts.map((item: any) => ({
          id: Number(item.id),
          date: item.receiptDate,
          title:
            item.consigneeName ||
            item.bilty?.consignee?.customerName ||
            item.bilty?.biltyNumber ||
            "Cash Receipt",
          reference: item.receiptNumber || `Receipt #${item.id}`,
          amount: Number(item.paidAmount ?? 0),
          type: "Cash Receipt",
        }));
      }
    }

    setStats({
      customers: customerCount,
      vehicles: vehicleCount,
      drivers: driverCount,
      bilties: biltyCount,
      receipts: receiptTotal,
      receiptCount,
    });
    setRecent(recentItems);
    setLastUpdated(new Date());
    setLoading(false);

    if (results.every((result) => result.status === "rejected")) {
      toast.error("Dashboard data load nahi hua. Backend aur login check kar.");
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customers === null ? "—" : stats.customers.toLocaleString("en-IN"),
      subtitle: "Registered customers",
      icon: Users,
      gradient: "from-blue-500 to-blue-700",
      glow: "shadow-blue-500/30",
    },
    {
      title: "Total Vehicles",
      value: stats.vehicles === null ? "—" : stats.vehicles.toLocaleString("en-IN"),
      subtitle: "Registered fleet",
      icon: Truck,
      gradient: "from-violet-500 to-indigo-700",
      glow: "shadow-indigo-500/30",
    },
    {
      title: "Total Drivers",
      value: stats.drivers === null ? "—" : stats.drivers.toLocaleString("en-IN"),
      subtitle: "Registered drivers",
      icon: UserRound,
      gradient: "from-amber-400 to-orange-600",
      glow: "shadow-orange-500/30",
    },
    {
      title: "Total Bilties",
      value: stats.bilties === null ? "—" : stats.bilties.toLocaleString("en-IN"),
      subtitle: "Transport records",
      icon: FileText,
      gradient: "from-teal-400 to-teal-700",
      glow: "shadow-teal-500/30",
    },
    {
      title: "Cash Receipts",
      value: money(stats.receipts),
      subtitle:
        stats.receiptCount === null
          ? "Receipt total for loaded records"
          : `${stats.receiptCount} recorded receipts`,
      icon: Wallet,
      gradient: "from-emerald-400 to-emerald-700",
      glow: "shadow-emerald-500/30",
    },
  ];

  const quickActions = [
    {
      title: "Create Bilty",
      description: "Add a new transport booking",
      href: "/dashboard/bilties",
      icon: FileText,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Cash Receipt",
      description: "Record received cash",
      href: "/dashboard/cash-receipt/add",
      icon: ReceiptText,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Manage Vehicles",
      description: "View your registered fleet",
      href: "/dashboard/vehicle",
      icon: Truck,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "View Ledger",
      description: "Review account transactions",
      href: "/dashboard/ledger",
      icon: Activity,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  const donutSegments = [
    { label: "Customers", value: stats.customers, color: "#2563eb" },
    { label: "Vehicles", value: stats.vehicles, color: "#7c3aed" },
    { label: "Drivers", value: stats.drivers, color: "#f59e0b" },
    { label: "Bilties", value: stats.bilties, color: "#0d9488" },
  ];

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a1f4a] to-blue-800 px-6 pb-24 pt-7 text-white shadow-xl sm:px-9 sm:pt-9">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse at top right, black 10%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at top right, black 10%, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur">
                <Truck size={14} />
                Shri Om Logistics ERP
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome to your Dashboard
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-blue-100/80 sm:text-base">
                Your logistics operations, fleet and business activity at a
                glance.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm text-blue-50 ring-1 ring-inset ring-white/10">
                  <CalendarDays size={16} />
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  onClick={() => void loadDashboard()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh Dashboard
                </button>
                {lastUpdated && (
                  <p className="text-xs text-blue-200/70">
                    Updated {lastUpdated.toLocaleTimeString("en-IN")}
                  </p>
                )}
              </div>
            </div>

            {/* Featured figure */}
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-md lg:w-[340px]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-100">
                  Cash receipts (loaded)
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                  <Wallet size={18} />
                </div>
              </div>
              {loading ? (
                <div className="mt-4 space-y-2.5" aria-hidden="true">
                  <div className="h-9 w-40 animate-pulse rounded-md bg-white/20" />
                  <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                </div>
              ) : (
                <>
                  <p className="mt-3 break-words text-3xl font-bold tracking-tight tabular-nums">
                    {money(stats.receipts)}
                  </p>
                  <p className="mt-1.5 text-xs text-blue-100/70">
                    {stats.receiptCount === null
                      ? "Receipt total for loaded records"
                      : `${stats.receiptCount} recorded receipts`}
                  </p>
                </>
              )}
            </div>
          </div>
        </header>

        {/* KPI cards overlapping the hero */}
        <section
          aria-label="Business overview"
          className="relative z-10 -mt-14 px-2 sm:px-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((item) => (
              <StatCard key={item.title} {...item} loading={loading} />
            ))}
          </div>
        </section>

        <div className="mt-6 space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Panel
              title="Cash Receipts Trend"
              subtitle="Amount per receipt, latest loaded records"
              icon={BarChart3}
              className="xl:col-span-2"
            >
              <ReceiptsChart items={recent} loading={loading} />
            </Panel>

            <Panel
              title="Records Overview"
              subtitle="Distribution across modules"
              icon={PieChart}
            >
              <RecordsDonut segments={donutSegments} loading={loading} />
            </Panel>
          </div>

          {/* Table + quick actions */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Panel
              title="Recent Cash Receipts"
              subtitle="Latest recorded customer receipts"
              icon={ReceiptText}
              className="xl:col-span-2"
              action={
                <Link
                  href="/dashboard/cash-receipt/add"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Cash Receipt</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Receipt No.</th>
                      <th className="px-5 py-3 font-semibold">Particulars</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Received
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} aria-hidden="true">
                          <td className="px-5 py-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-100" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                          </td>
                        </tr>
                      ))
                    ) : recent.length ? (
                      recent.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-blue-50/40"
                        >
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                            {dateLabel(item.date)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                              {item.reference}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
                                {(item.title || "C").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-900">
                                {item.title}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-emerald-700">
                            {money(item.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Recorded
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-14">
                          <div className="flex flex-col items-center text-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <Inbox size={20} />
                            </div>
                            <p className="mt-3 text-sm font-medium text-slate-700">
                              No cash receipts found
                            </p>
                            <p className="mt-1 max-w-sm text-sm text-slate-500">
                              No cash receipts found, or the receipt API is
                              unavailable.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Showing the latest loaded receipts
                </p>
                <Link
                  href="/dashboard/ledger"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  View Ledger <ArrowUpRight size={15} />
                </Link>
              </div>
            </Panel>

            <Panel
              title="Quick Actions"
              subtitle="Jump directly to frequently used modules."
              icon={Activity}
            >
              <div className="space-y-2.5 p-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {action.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                      />
                    </Link>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row">
          <p>Shri Om Logistics ERP · Business Overview</p>
          <p>Data shown depends on available records and API responses.</p>
        </footer>
      </div>
    </div>
  );
}