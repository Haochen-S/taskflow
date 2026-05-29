import { AuthGuard } from "@/components/AuthGuard";
import { TodoApp } from "@/components/TodoApp";

export default function HomePage() {
  return (
    <AuthGuard>
      <TodoApp />
    </AuthGuard>
  );
}
