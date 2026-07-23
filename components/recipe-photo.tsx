import Image from "next/image";
import { cn } from "@/lib/utils";

export function RecipePhoto({ src, alt, className, sizes = "(min-width: 1280px) 35vw, (min-width: 768px) 50vw, 100vw" }: { src: string; alt: string; className?: string; sizes?: string }) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className={cn("relative block aspect-[16/9] w-full overflow-hidden rounded-t-md bg-muted p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      aria-label={`Abrir foto de ${alt} em tamanho ampliado`}
    >
      <Image src={src} alt={alt} fill sizes={sizes} unoptimized className="object-contain p-1" />
    </a>
  );
}