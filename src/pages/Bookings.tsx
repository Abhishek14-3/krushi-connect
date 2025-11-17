import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, X } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    // Get all equipment IDs for this seller
    const { data: equipmentData } = await supabase
      .from("equipment")
      .select("id")
      .eq("seller_id", user?.id);

    if (!equipmentData || equipmentData.length === 0) {
      setBookings([]);
      return;
    }

    const equipmentIds = equipmentData.map(e => e.id);

    // Fetch bookings for seller's equipment
    const { data } = await supabase
      .from("bookings")
      .select("*, equipment(name, price_per_hour), profiles(name, phone)")
      .in("equipment_id", equipmentIds)
      .order("created_at", { ascending: false });

    setBookings(data || []);
  };

  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: status === "approved" ? "Booking Approved" : "Booking Rejected",
        description: `The booking has been ${status}`,
      });
      fetchBookings();
    }
  };

  const filterBookings = (status: string) => {
    if (status === "all") return bookings;
    return bookings.filter(b => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="border-border shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.equipment?.name}</CardTitle>
            <CardDescription>by {booking.profiles?.name}</CardDescription>
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
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-medium">{new Date(booking.start_date).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">End Date</span>
            <span className="font-medium">{new Date(booking.end_date).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-bold text-primary">₹{booking.total_cost}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Contact</span>
            <span className="font-medium">{booking.profiles?.phone}</span>
          </div>
        </div>
        
        {booking.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => updateBookingStatus(booking.id, "approved")}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => updateBookingStatus(booking.id, "rejected")}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Booking Requests
          </h1>
          <p className="text-sm text-muted-foreground">Manage equipment rental requests</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filterBookings("all").length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              filterBookings("all").map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filterBookings("pending").length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No pending bookings</p>
                </CardContent>
              </Card>
            ) : (
              filterBookings("pending").map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filterBookings("approved").length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No approved bookings</p>
                </CardContent>
              </Card>
            ) : (
              filterBookings("approved").map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filterBookings("rejected").length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No rejected bookings</p>
                </CardContent>
              </Card>
            ) : (
              filterBookings("rejected").map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Bookings;
