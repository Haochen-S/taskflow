import { GuestGuard } from "@/components/AuthGuard";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 px-4">
        <RegisterForm />
      </div>
    </GuestGuard>
  );
}
