import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Variant = "arched" | "offset" | "sloped";

type Props = {
  image: string;
  imageAlt: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: Variant;
};

export function EditorialImageCard({
  image,
  imageAlt,
  title,
  description,
  className,
  variant = "arched",
}: Props) {
  const shapeStyles: Record<Variant, string> = {
    arched: "rounded-t-[40%] rounded-b-2xl",
    offset: "rounded-2xl",
    sloped: "rounded-2xl clip-path-[polygon(0_8%,100%_0,100%_100%,0_100%)]",
  };

  return (
    <Reveal className={cn("group", className)}>
      <div className="relative">
        {/* Dark-red backing shape */}
        {variant === "offset" && (
          <div className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl bg-crimson-dark/10" />
        )}
        {variant === "sloped" && (
          <div className="absolute -bottom-2 -left-2 h-full w-full rounded-2xl bg-crimson-dark/8" />
        )}

        {/* Image container */}
        <div className={cn("relative overflow-hidden bg-beige-soft", shapeStyles[variant])}>
          <img
            src={image}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        {/* Text */}
        {(title || description) && (
          <div className="mt-5 px-1">
            {title && (
              <h3 className="font-headings text-lg font-bold text-ink">{title}</h3>
            )}
            {description && (
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{description}</p>
            )}
          </div>
        )}
      </div>
    </Reveal>
  );
}
