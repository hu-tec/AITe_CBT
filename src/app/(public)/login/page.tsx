import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">AITe CBT</h1>
          <p className="mt-1 text-sm text-gray-500">로그인하여 시험에 응시하세요</p>
        </div>
        <LoginForm />
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-400">
          <p>테스트: test@test.com / test</p>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>
      </Card>
    </div>
  );
}
