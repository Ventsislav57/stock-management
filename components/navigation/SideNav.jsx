"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// Heroicons
import {
    HomeIcon,
    CubeIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    ClipboardDocumentListIcon,
    DocumentMinusIcon,
    ChartBarIcon,
    TruckIcon,
} from "@heroicons/react/24/outline";

const navItems = [
    { href: "/", label: "Начало", icon: HomeIcon },
    { href: "/products", label: "Продукти", icon: CubeIcon },
    { href: "/stock-in", label: "Доставки", icon: ArrowDownTrayIcon },
    { href: "/stock-out", label: "Продажби", icon: ArrowUpTrayIcon },
    { href: "/writeoff", label: "Изписвания", icon: DocumentMinusIcon },
    { href: "/orders", label: "Поръчки", icon: ClipboardDocumentListIcon },
    { href: "/logs", label: "Активности", icon: ChartBarIcon },
    { href: "/distributors", label: "Дистрибутори", icon: TruckIcon }
];

export default function SideNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile top bar */}
            <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-gray-900 text-white border-b border-gray-700">
                <img
                    src="https://stromet.s3.eu-north-1.amazonaws.com/logo.png"
                    className="h-10"
                    alt="logo"
                />
                <button onClick={() => setOpen(true)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="32"
                        viewBox="0 -960 960 960"
                        width="32"
                        fill="#fff"
                    >
                        <path d="M120-680v-80h720v80H120Zm0 480v-80h720v80H120Zm0-240v-80h720v80H120Z" />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 h-full w-64 bg-gray-900 text-white border-r border-gray-700 transform transition-transform duration-300 z-40 ${
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="flex flex-col items-center py-6 border-b border-gray-700">
                    <img
                        src="https://stromet.s3.eu-north-1.amazonaws.com/house_logo.png"
                        className="hidden lg:block w-40"
                        alt="logo"
                    />
                    <img
                        src="https://stromet.s3.eu-north-1.amazonaws.com/logo.png"
                        className="lg:hidden w-40"
                        alt="logo"
                    />
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg transition ${
                                    active
                                        ? "bg-gray-800 text-white shadow-lg"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                                <Icon className="h-6 w-6" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-6 left-0 w-full px-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                    >
                        Изход
                    </button>
                </div>

                {/* Close button (mobile) */}
                <button
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-2xl text-white"
                >
                    ✕
                </button>
            </aside>

            {/* Overlay for mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
}
