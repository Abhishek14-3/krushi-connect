import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, TrendingUp } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEquipment: 0, activeBookings: 0, pendingRequests: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch seller's equipment
    const { data: equipmentData } = await supabase
      .from("equipment")
      .select("*")
      .eq("seller_id", user?.id);

    // Fetch booking requests for seller's equipment
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*, equipment(name, seller_id), profiles(name)")
      .in("equipment_id", equipmentData?.map(e => e.id) || [])
      .order("created_at", { ascending: false })
      .limit(5);

    const pendingCount = bookingsData?.filter(b => b.status === "pending").length || 0;
    const activeCount = bookingsData?.filter(b => b.status === "approved").length || 0;

    setEquipment(equipmentData || []);
    setBookingRequests(bookingsData || []);
    setStats({
      totalEquipment: equipmentData?.length || 0,
      activeBookings: activeCount,
      pendingRequests: pendingCount,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your equipment and bookings</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.totalEquipment}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.activeBookings}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.pendingRequests}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action */}
        <Button asChild size="lg" className="w-full gap-2">
          <Link to="/my-equipment">
            <Plus className="h-5 w-5" />
            Add New Equipment
          </Link>
        </Button>

        {/* My Equipment */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                My Equipment
              </CardTitle>
              <Button asChild variant="link" size="sm">
                <Link to="/my-equipment">Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {equipment.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No equipment listed yet</p>
                <Button asChild variant="outline">
                  <Link to="/my-equipment">Add Your First Equipment</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {equipment.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price_per_hour}/hr</p>
                    </div>
                    <Badge variant={item.is_available ? "default" : "secondary"}>
                      {item.is_available ? "Available" : "Rented"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Requests */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Booking Requests
                </CardTitle>
                <CardDescription>Review and manage rental requests</CardDescription>
              </div>
              <Button asChild variant="link" size="sm">
                <Link to="/bookings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bookingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No booking requests</p>
            ) : (
              <div className="space-y-3">
                {bookingRequests.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{booking.equipment?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        by {booking.profiles?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        booking.status === "approved" ? "default" :
                        booking.status === "pending" ? "secondary" :
                        "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default SellerDashboard;
