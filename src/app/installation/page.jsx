import ProtectedRoute from "@/components/ProtectedRoute";
import InstallationForm from "@/components/InstallationForm";  // ✅ Yeh sahi naam hai

export default function InstallationPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hod', 'installation']}>
      <main className="min-h-screen bg-slate-950">
        <InstallationForm />
      </main>
    </ProtectedRoute>
  );
}