import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-2 text-gray-600">페이지를 찾을 수 없습니다</p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary">홈으로</Button>
        </Link>
      </div>
    </div>
  );
}
