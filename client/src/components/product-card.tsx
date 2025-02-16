import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2 } from "lucide-react";
import PriceChart from "./price-chart";

export default function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();

  async function deleteProduct() {
    try {
      await apiRequest("DELETE", `/api/products/${product.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been removed from your tracking list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium leading-none">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            Current Price: ${(product.currentPrice / 100).toFixed(2)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={deleteProduct}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <PriceChart productId={product.id} />
      </CardContent>
    </Card>
  );
}
