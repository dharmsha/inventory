import ProtectedRoute from "@/components/ProtectedRoute";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <main className="min-h-screen bg-slate-950">
        <AdminPanel />
      </main>
    </ProtectedRoute>
  );
}