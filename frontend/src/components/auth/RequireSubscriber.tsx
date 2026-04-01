import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionLocked from "@/pages/SubscriptionLocked";

export const RequireSubscriber = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, subscriptionActive } = useAuth();

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

  if (!subscriptionActive) {
    return <SubscriptionLocked />;
  }

  return <>{children}</>;
};
