import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

const Marketplace = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  const filterByCategory = (category: string) => {
    return products.filter(p => p.category === category);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ProductGrid = ({ products }: { products: any[] }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No products available</p>
        </div>
      ) : (
        products.map((product) => (
          <Card key={product.id} className="border-border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              {product.image_url && (
                <div className="aspect-square w-full rounded-lg bg-muted mb-4 overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {product.stock_quantity}
                  </p>
                </div>
                <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                  {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header title="Marketplace" subtitle="Buy quality seeds, fertilizers, and tools" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="seeds">Seeds</TabsTrigger>
            <TabsTrigger value="fertilizer">Fertilizers</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ProductGrid products={products} />
          </TabsContent>

          <TabsContent value="seeds">
            <ProductGrid products={filterByCategory("seeds")} />
          </TabsContent>

          <TabsContent value="fertilizer">
            <ProductGrid products={filterByCategory("fertilizer")} />
          </TabsContent>

          <TabsContent value="tools">
            <ProductGrid products={filterByCategory("tools")} />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Marketplace;
