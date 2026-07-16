import { Laptop, Moon, Sun, Check } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 shrink-0 rounded-xl border border-border bg-card/40 text-foreground transition-all hover:bg-accent focus-visible:ring-emerald-300"
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-teal-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg backdrop-blur-md"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-teal-400" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-gray-500" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
