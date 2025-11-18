import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";

const OrderTracking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    
    // Realtime subscription for bookings
    const channel = supabase
      .channel("order-tracking")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `farmer_id=eq.${user?.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrders = async () => {
    // Fetch equipment bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*, equipment(name, image_url), profiles(name, phone)")
      .eq("farmer_id", user?.id)
      .order("created_at", { ascending: false });

    // Fetch product orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, products(name, image_url)")
      .eq("buyer_id", user?.id)
      .order("created_at", { ascending: false });

    setBookings(bookingsData || []);
    setOrders(ordersData || []);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "completed":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header title="Order Tracking" subtitle="Track your bookings and orders" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="equipment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equipment">Equipment Bookings</TabsTrigger>
            <TabsTrigger value="products">Product Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No equipment bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="border-border shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {booking.equipment?.image_url && (
                          <img
                            src={booking.equipment.image_url}
                            alt={booking.equipment?.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{booking.equipment?.name}</CardTitle>
                          <CardDescription>Seller: {booking.profiles?.name}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(booking.status)} className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Booking Date:</span>
                        <span className="font-medium">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">
                          {new Date(booking.start_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End:</span>
                        <span className="font-medium">
                          {new Date(booking.end_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-bold text-primary text-lg">
                          ₹{booking.total_cost}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No product orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-border shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {order.products?.image_url && (
                          <img
                            src={order.products.image_url}
                            alt={order.products?.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{order.products?.name}</CardTitle>
                          <CardDescription>Quantity: {order.quantity}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span className="font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {order.delivery_address && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery:</span>
                          <span className="font-medium">{order.delivery_address}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Total Price:</span>
                        <span className="font-bold text-primary text-lg">
                          ₹{order.total_price}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default OrderTracking;
