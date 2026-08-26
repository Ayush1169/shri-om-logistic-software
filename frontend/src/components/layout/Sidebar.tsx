"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Truck,
  UserCircle,
  FileText,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customer",
    href: "/dashboard/customer",
    icon: Users,
  },
  {
    title: "Vehicle",
    href: "/dashboard/vehicle",
    icon: Truck,
  },
  {
    title: "Drivers",
    href: "/dashboard/drivers",
    icon: UserCircle,
  },
  {
    title: "Bilty",
    href: "/dashboard/bilties",
    icon: FileText,
  },
  {
    title: "Cash Receipt",
    href: "/dashboard/accounts",
    icon: Receipt,
  },
  {
    title: "Ledger",
    href: "/dashboard/ledger",
    icon: Wallet,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");

    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen w-72 flex-col
          bg-slate-900 text-white shadow-xl
          transition-transform duration-300

          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }

          lg:static lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <div>
            <h1 className="text-xl font-bold">
              Shri Om Logistics
            </h1>

            <p className="text-sm text-slate-400">
              ERP System
            </p>
          </div>

          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-700 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all

                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-5">
          <div className="mb-4">
            <h3 className="font-semibold">
              Shri Om Logistics
            </h3>

            <p className="text-sm text-slate-400">
              ERP v1.0
            </p>
          </div>

          <button
  onClick={handleLogout}
  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 font-medium transition hover:bg-red-600"
>
  <LogOut size={18} />
  Logout
</button>
        </div>
      </aside>
    </>
  );
}