import { useQuery } from "@tanstack/react-query";
import { PriceHistory } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

export default function PriceChart({ productId }: { productId: number }) {
  const { data: history } = useQuery<PriceHistory[]>({
    queryKey: [`/api/products/${productId}/history`],
  });

  if (!history?.length) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        No price history available
      </Card>
    );
  }

  const data = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString(),
    price: h.price / 100,
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
