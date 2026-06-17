import * as React from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("focus-ring flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm", className)} {...props} />
  );
}
