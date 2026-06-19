"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function RecipePhoto({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="relative block aspect-[16/9] w-full overflow-hidden rounded-t-md bg-muted p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar foto de ${alt}`}
      >
        <Image src={src} alt={alt} fill sizes="(min-width: 1280px) 35vw, (min-width: 768px) 50vw, 100vw" className="object-contain p-2" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ampliada de ${alt}`}
          onClick={() => setOpen(false)}
        >
          <div className="relative h-[85vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" priority />
            <Button type="button" size="icon" variant="secondary" className="absolute right-0 top-0" onClick={() => setOpen(false)} aria-label="Fechar">
              <X className="size-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
