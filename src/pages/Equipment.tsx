import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Info } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Equipment = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from("equipment")
      .select("*, profiles(name, phone)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    setEquipment(data || []);
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Calculate total cost (simplified - assuming hourly rate)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const totalCost = hours * selectedEquipment.price_per_hour;

    const { error } = await supabase.from("bookings").insert({
      equipment_id: selectedEquipment.id,
      farmer_id: user?.id,
      start_date: startDate,
      end_date: endDate,
      total_cost: totalCost,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking Successful",
        description: "Your rental request has been sent to the seller",
      });
      setIsBookingDialogOpen(false);
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header title="Equipment Rental" subtitle="Rent tractors, harvesters, and more" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {equipment.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No equipment available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <Card key={item.id} className="border-border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  {item.image_url && (
                    <div className="aspect-video w-full rounded-lg bg-muted mb-4 overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>by {item.profiles?.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{item.price_per_hour}</p>
                      <p className="text-xs text-muted-foreground">per hour</p>
                    </div>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => {
                      setSelectedEquipment(item);
                      setIsBookingDialogOpen(true);
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {selectedEquipment?.name}</DialogTitle>
            <DialogDescription>
              Select your rental period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date & Time</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date & Time</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Booking Details</p>
                  <p className="text-sm text-muted-foreground">Rate: ₹{selectedEquipment?.price_per_hour}/hour</p>
                  <p className="text-sm text-muted-foreground">Seller: {selectedEquipment?.profiles?.name}</p>
                  {startDate && endDate && (
                    <p className="text-sm font-medium text-primary pt-2">
                      Estimated Cost: ₹
                      {Math.ceil(
                        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                          (1000 * 60 * 60)
                      ) * selectedEquipment?.price_per_hour}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBooking} disabled={loading}>
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Equipment;
