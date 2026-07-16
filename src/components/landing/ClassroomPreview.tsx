import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { FeatureCallout } from "./FeatureCallout";
import { ProductScreenshotFrame } from "./ProductScreenshotFrame";

type Callout = {
  label: string;
  position: string;
};

type Props = {
  screenshot: string;
  callouts: Callout[];
  className?: string;
};

export function ClassroomPreview({ screenshot, callouts, className }: Props) {
  return (
    <Reveal className={cn("relative w-full", className)}>
      <ProductScreenshotFrame className="w-full">
        <img
          src={screenshot}
          alt="Classroom preview"
          className="w-full object-cover"
          loading="lazy"
        />
      </ProductScreenshotFrame>

      {/* Floating callout dots */}
      {callouts.map((c, i) => (
        <FeatureCallout
          key={i}
          label={c.label}
          position={c.position}
          className={cn(
            i % 2 === 0 ? "left-0 -translate-x-4" : "right-0 translate-x-4",
            "hidden lg:flex",
          )}
        />
      ))}
    </Reveal>
  );
}
