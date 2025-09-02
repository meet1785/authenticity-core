import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: boolean;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = false,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative p-6 rounded-lg transition-all duration-300",
        gradient
          ? "gradient-border"
          : "glass-effect hover:border-primary/50",
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
      )}
      
      <div className={gradient ? "bg-card rounded-[calc(var(--radius)-1px)] p-6" : ""}>
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Icon className="h-8 w-8 text-primary" />
            <div className="absolute inset-0 h-8 w-8 bg-primary/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}