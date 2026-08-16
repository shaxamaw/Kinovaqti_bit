import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Yuklanmoqda…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}
