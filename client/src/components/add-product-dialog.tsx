import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { scrapeProductInfo } from "@/lib/scraper";
import { useState } from "react";

type AddProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      url: "",
      targetPrice: 0,
      notifyOnDrop: true,
    },
  });

  async function onSubmit(data: any) {
    try {
      setIsLoading(true);
      const productInfo = await scrapeProductInfo(data.url);
      await apiRequest("POST", "/api/products", {
        ...data,
        name: productInfo.name,
        platform: productInfo.platform,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onOpenChange(false);
      form.reset();

      toast({
        title: "Product added",
        description: "You'll be notified when the price drops below your target",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product to Track</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}