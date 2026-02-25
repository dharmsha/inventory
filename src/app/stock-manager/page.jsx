import ProtectedRoute from "@/components/ProtectedRoute";
import StockManager from "@/components/StockManager";

export default function StockManagerPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hod', 'stock_manager']}>
      <main className="min-h-screen bg-slate-950">
        <StockManager />
      </main>
    </ProtectedRoute>
  );
}