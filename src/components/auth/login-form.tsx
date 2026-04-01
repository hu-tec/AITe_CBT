"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label="이메일"
        placeholder="email@example.com"
        required
        error={state.fieldErrors?.email?.[0]}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        placeholder="6자 이상"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
