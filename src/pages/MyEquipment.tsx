import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const MyEquipment = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_hour: "",
    image_url: "",
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .eq("seller_id", user?.id)
      .order("created_at", { ascending: false });

    setEquipment(data || []);
  };

  const handleAddEquipment = async () => {
    if (!formData.name || !formData.price_per_hour) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("equipment").insert({
      seller_id: user?.id,
      name: formData.name,
      description: formData.description,
      price_per_hour: parseFloat(formData.price_per_hour),
      image_url: formData.image_url || null,
      is_available: true,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Equipment added successfully",
      });
      setIsAddDialogOpen(false);
      setFormData({ name: "", description: "", price_per_hour: "", image_url: "" });
      fetchEquipment();
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("equipment")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Updated",
        description: `Equipment marked as ${!currentStatus ? "available" : "unavailable"}`,
      });
      fetchEquipment();
    }
  };

  const deleteEquipment = async (id: string) => {
    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Equipment removed successfully",
      });
      fetchEquipment();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-6 w-6" />
              My Equipment
            </h1>
            <p className="text-sm text-muted-foreground">Manage your rental equipment</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {equipment.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No equipment listed yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Equipment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <Card key={item.id} className="border-border shadow-md">
                <CardHeader>
                  {item.image_url && (
                    <div className="aspect-video w-full rounded-lg bg-muted mb-4 overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant={item.is_available ? "default" : "secondary"}>
                      {item.is_available ? "Available" : "Rented"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-2xl font-bold text-primary">₹{item.price_per_hour}/hr</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                      className="flex-1"
                    >
                      {item.is_available ? "Mark Unavailable" : "Mark Available"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteEquipment(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              List your equipment for farmers to rent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Deere Tractor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your equipment..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Hour (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="500"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEquipment} disabled={loading}>
              {loading ? "Adding..." : "Add Equipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default MyEquipment;
