import ProtectedRoute from "@/components/ProtectedRoute";
import DispatchManager from "@/components/DispatchManager";

export default function DispatchPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hod', 'dispatch']}>  {/* ✅ Admin, HOD, Dispatch */}
      <main className="min-h-screen bg-slate-950">
        <DispatchManager />
      </main>
    </ProtectedRoute>
  );
}