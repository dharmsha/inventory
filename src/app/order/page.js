"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import OrderForm from "@/components/OrderForm";

export default function OrderPage() {
  return (
    <ProtectedRoute allowedRoles={["order"]}>
      <main className="min-h-screen bg-slate-950">
        <OrderForm />
      </main>
    </ProtectedRoute>
  );
}