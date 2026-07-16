import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ProductScreenshotFrame } from "./ProductScreenshotFrame";

type Props = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  screenshot?: string;
  screenshotAlt?: string;
  className?: string;
};

export function EditorialHero({
  eyebrow = "Built for African schools",
  heading = "The classroom, reimagined.",
  description = "A complete virtual learning environment designed for how teachers actually teach and students actually learn.",
  screenshot,
  screenshotAlt = "Product screenshot",
  className,
}: Props) {
  return (
    <section
      id="editorial-hero"
      className={cn(
        "relative overflow-hidden bg-page-background py-20 lg:py-28",
        className,
      )}
    >
      {/* Warm background shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-crimson-dark/[0.04]" />
        <div className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-beige/40" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[2.5rem] bg-crimson-soft/30" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        {/* Text */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="mb-5 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-crimson-dark">
              {eyebrow}
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="font-headings text-[38px] font-extrabold leading-[1.06] text-ink sm:text-[48px] md:text-[56px] lg:text-[64px] tracking-tight">
              {heading}
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-6 text-[17px] leading-[1.7] text-muted max-w-[520px] mx-auto">
              {description}
            </p>
          </Reveal>
        </div>

        {/* Screenshot with surrounding illustration area */}
        <Reveal delay={3} className="mt-14 lg:mt-20">
          <div className="relative mx-auto max-w-[1000px]">
            {/* Decorative illustration spots around the frame */}
            <div className="pointer-events-none absolute -left-16 top-1/4 hidden lg:block">
              <div className="h-20 w-20 rounded-full border border-crimson-dark/10 bg-crimson-soft/20" />
              <div className="ml-6 mt-2 h-3 w-16 rounded-full bg-beige" />
            </div>
            <div className="pointer-events-none absolute -right-12 top-1/3 hidden lg:block">
              <div className="h-14 w-14 rotate-12 rounded-2xl border border-crimson-dark/10 bg-beige-soft" />
            </div>
            <div className="pointer-events-none absolute -bottom-8 left-1/4 hidden lg:block">
              <div className="h-10 w-10 rounded-full bg-crimson-dark/5" />
            </div>

            <ProductScreenshotFrame>
              {screenshot ? (
                <img
                  src={screenshot}
                  alt={screenshotAlt}
                  className="w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[340px] items-center justify-center bg-page-background sm:h-[440px] lg:h-[520px]">
                  <span className="text-[14px] text-muted">Product screenshot</span>
                </div>
              )}
            </ProductScreenshotFrame>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
