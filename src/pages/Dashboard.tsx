import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import FarmerDashboard from "./FarmerDashboard";
import SellerDashboard from "./SellerDashboard";
import LaborerDashboard from "./LaborerDashboard";

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <>
      {userRole === "farmer" && <FarmerDashboard />}
      {userRole === "seller" && <SellerDashboard />}
      {userRole === "laborer" && <LaborerDashboard />}
    </>
  );
};

export default Dashboard;
