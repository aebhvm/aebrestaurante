import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, icon: Icon, tone = "blue" }: { label: string; value: string | number; icon: LucideIcon; tone?: "blue" | "green" | "amber" | "rose" }) {
  const tones = {
    blue: "bg-blue-500/12 text-blue-500",
    green: "bg-emerald-500/12 text-emerald-500",
    amber: "bg-amber-500/12 text-amber-500",
    rose: "bg-rose-500/12 text-rose-500"
  };
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
