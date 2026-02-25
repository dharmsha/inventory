"use client";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { userRole, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
     const dashboardMap = {
  admin: "/admin",
  hod: "/hod",
  stock_manager: "/stock-manager",
  dispatch: "/dispatch",
  installation: "/installation",  // ✅ FIXED
  order: "/order"                 // ✅ FIXED
};
      router.replace(dashboardMap[userRole] || "/");
    }
  }, [loading, isAuthenticated, userRole, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
}