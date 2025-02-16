import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import AddProductDialog from "@/components/add-product-dialog";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Plus, LogOut } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <div className="flex gap-4">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <AddProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}