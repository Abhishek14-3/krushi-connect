import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Package, Users, ShoppingBag, Tractor } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [laborers, setLaborers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch available equipment
    const { data: equipmentData } = await supabase
      .from("equipment")
      .select("*, profiles(name)")
      .eq("is_available", true)
      .limit(3);

    // Fetch available laborers
    const { data: laborData } = await supabase
      .from("labor_profiles")
      .select("*, profiles(name, phone)")
      .eq("is_available", true)
      .limit(3);

    // Fetch user's bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*, equipment(name), profiles(name)")
      .eq("farmer_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(3);

    setEquipment(equipmentData || []);
    setLaborers(laborData || []);
    setBookings(bookingsData || []);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back!</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Weather Widget */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Today's Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">24°C</p>
                <p className="text-sm text-muted-foreground">Partly Cloudy</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Humidity: 65%</p>
                <p>Wind: 12 km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/equipment">
              <Tractor className="h-8 w-8 text-primary" />
              <span>Rent Equipment</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/laborers">
              <Users className="h-8 w-8 text-primary" />
              <span>Hire Labor</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/marketplace">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span>Buy Products</span>
            </Link>
          </Button>
        </div>

        {/* Available Equipment */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Available Equipment
              </CardTitle>
              <Button asChild variant="link" size="sm">
                <Link to="/equipment">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {equipment.length === 0 ? (
              <p className="text-sm text-muted-foreground">No equipment available</p>
            ) : (
              <div className="space-y-3">
                {equipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">by {item.profiles?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">₹{item.price_per_hour}/hr</p>
                      <Badge variant="secondary" className="mt-1">Available</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>Track your equipment rentals</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{booking.equipment?.name}</p>
                      <p className="text-sm text-muted-foreground">
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

export default FarmerDashboard;
