import ProtectedRoute from "@/components/ProtectedRoute";
import HodAdminPanel from "@/components/HodAdminPanel";

export default function HodPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hod']}>  {/* ✅ Admin aur HOD */}
      <main className="min-h-screen bg-slate-950">
        <HodAdminPanel />
      </main>
    </ProtectedRoute>
  );
}