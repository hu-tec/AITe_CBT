"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/categories", label: "카테고리 관리" },
  { href: "/admin/questions", label: "문제 관리" },
  { href: "/admin/exams", label: "시험 관리" },
  { href: "/admin/results", label: "응시 결과" },
];

export function AdminSidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-lg font-bold text-blue-600">AITe CBT</h1>
        <p className="text-xs text-gray-500">관리자</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-200"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <p className="mb-2 px-3 text-xs text-gray-500 truncate">
          {userName ?? "관리자"}
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
