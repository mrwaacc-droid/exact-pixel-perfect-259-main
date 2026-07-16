import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  eyebrowColor?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "center",
  className,
  eyebrowColor = "text-crimson-dark",
}: Props) {
  return (
    <Reveal
      className={cn(
        align === "center" && "mx-auto max-w-[760px] text-center",
        align === "left" && "max-w-[680px] text-left",
        className,
      )}
    >
      <span
        className={cn(
          "mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.18em]",
          eyebrowColor,
        )}
      >
        {eyebrow}
      </span>
      <h2 className="font-headings text-[34px] font-extrabold leading-[1.08] text-ink sm:text-[40px] md:text-[44px]">
        {heading}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-7 text-muted">{description}</p>
      )}
    </Reveal>
  );
}
