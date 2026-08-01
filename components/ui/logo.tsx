// src/components/ui/logo.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export const Logo = ({ className, variant = "full" }: LogoProps) => {
  // On définit des dimensions de base pour éviter le layout shift
  const width = variant === "full" ? 180 : 40;
  const height = 40;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src={variant === "full" ? "/logo.svg" : "/logo-icon.svg"}
        alt="Factouro"
        width={width}
        height={height}
        className="h-full w-auto object-contain" // Permet au Logo de s'adapter à la hauteur du parent (h-6, h-10, etc.)
        priority
      />
    </div>
  );
};
