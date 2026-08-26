"use client";

import { Bell, CalendarDays, Menu, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: NavbarProps) {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-gray-800 md:text-xl">
            Dashboard
          </h1>

          <p className="hidden text-sm text-gray-500 md:block">
            Welcome to Shri Om Logistics
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 lg:flex">
          <Search size={18} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search..."
            className="w-56 outline-none text-sm"
          />
        </div>

        {/* Notification */}
        <button className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
          <Bell size={20} />
        </button>

        {/* Date */}
        <div className="hidden items-center gap-2 text-sm text-gray-600 xl:flex">
          <CalendarDays size={18} />
          <span>{today}</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 rounded-lg border px-2 py-2 md:px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="hidden md:block">
            <p className="font-semibold text-gray-800">
              {user?.fullName}
            </p>

            <p className="text-xs text-gray-500">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}