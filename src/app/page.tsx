import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          AITe <span className="text-blue-600">CBT</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          AI 교육 및 자격인증 시험 플랫폼
        </p>
        <p className="mt-1 text-sm text-gray-400">
          학습부터 모의시험, 자격인증까지
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/login">
            <Button>로그인</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary">회원가입</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
