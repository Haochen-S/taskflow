import { GuestGuard } from "@/components/AuthGuard";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 px-4">
        <LoginForm />
      </div>
    </GuestGuard>
  );
}
