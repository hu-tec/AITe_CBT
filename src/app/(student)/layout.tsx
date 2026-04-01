import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentNav } from "@/components/student/nav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StudentNav userName={session.user.name} />
      <main className="mx-auto w-full max-w-7xl flex-1 p-6">{children}</main>
    </div>
  );
}
