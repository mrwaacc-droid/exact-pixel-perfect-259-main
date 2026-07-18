import { Toaster as Sonner } from "sonner";
import { CircleCheck, CircleAlert, Info, TriangleAlert } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Klassruum global toast surface.
 *
 * Single source of truth for notification appearance. Every toast:
 *   - Uses design tokens (radius, shadows, brand colors).
 *   - Carries an icon that maps to the toast kind.
 *   - Renders on warm off-white surfaces with a soft burgundy accent line
 *     for actions, keeping with the rest of the app's restrained palette.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      expand
      richColors={false}
      closeButton
      duration={5000}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast relative flex w-full items-start gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white px-4 py-3.5 text-sm text-[var(--ink)] shadow-[var(--shadow-lg)] backdrop-blur-sm",
          description: "mt-1 text-[13px] leading-5 text-[var(--muted)]",
          title: "text-[14px] font-semibold leading-5 text-[var(--ink)]",
          content: "flex-1 min-w-0",
          actionButton:
            "ml-2 inline-flex h-8 items-center justify-center rounded-[var(--radius)] bg-[var(--crimson)] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--crimson-hover)]",
          cancelButton:
            "ml-2 inline-flex h-8 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 text-[12px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--hover-bg)]",
          closeButton:
            "absolute right-2.5 top-2.5 rounded-full p-1 text-[var(--muted)] opacity-70 transition-opacity hover:text-[var(--ink)] hover:opacity-100",
          success:
            "border-l-[3px] border-l-[var(--success)] [&_[data-icon]]:text-[var(--success)]",
          error:
            "border-l-[3px] border-l-[var(--error)] [&_[data-icon]]:text-[var(--error)]",
          warning:
            "border-l-[3px] border-l-[var(--warning)] [&_[data-icon]]:text-[var(--warning)]",
          info:
            "border-l-[3px] border-l-[var(--info)] [&_[data-icon]]:text-[var(--info)]",
          icon: "mt-0.5 shrink-0 [&_svg]:h-[18px] [&_svg]:w-[18px]",
        },
      }}
      icons={{
        success: <CircleCheck data-icon />,
        error: <CircleAlert data-icon />,
        warning: <TriangleAlert data-icon />,
        info: <Info data-icon />,
        loading: <span data-icon className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--crimson)]" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
