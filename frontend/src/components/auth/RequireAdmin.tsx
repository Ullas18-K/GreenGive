import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
