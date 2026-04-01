"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/student", label: "대시보드" },
  { href: "/student/exams", label: "시험 목록" },
  { href: "/student/history", label: "응시 이력" },
  { href: "/student/study", label: "학습 모드" },
];

export function StudentNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/student" className="text-lg font-bold text-blue-600">
            AITe CBT
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{userName}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
