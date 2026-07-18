import React from "react";
import { useTheme } from "@/components/theme/ThemeContext";
import type { SceneState } from "./CinematicSceneManager";
import type { TierConfig } from "@/hooks/useDeviceTier";

interface HeliosCanvasProps {
  sceneState: SceneState;
  tierConfig: TierConfig;
  reducedMotion: boolean;
}

export const HeliosCanvas: React.FC<HeliosCanvasProps> = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-300 ${
        isDark ? "bg-[#030712]" : "bg-[#FAF8F7]"
      }`}
      aria-hidden="true"
    >
      {/* Premium ambient radial glows */}
      {isDark ? (
        <>
          {/* Dark Mode Glows */}
          <div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] mix-blend-screen transition-opacity duration-300"
            style={{ transform: "translate(-50%, -30%)" }}
          />
          <div
            className="absolute top-[20%] right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px] mix-blend-screen transition-opacity duration-300"
            style={{ transform: "translate(50%, -20%)" }}
          />
          <div
            className="absolute top-[60%] left-1/3 w-[600px] h-[600px] rounded-full bg-teal-500/3 blur-[130px] mix-blend-screen transition-opacity duration-300"
            style={{ transform: "translate(-30%, -20%)" }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full bg-emerald-500/4 blur-[120px] mix-blend-screen transition-opacity duration-300"
            style={{ transform: "translate(30%, 30%)" }}
          />
        </>
      ) : (
        <>
          {/* Light Mode Glows - subtle vibrant pastels */}
          <div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-400/12 blur-[120px] mix-blend-multiply transition-opacity duration-300"
            style={{ transform: "translate(-50%, -30%)" }}
          />
          <div
            className="absolute top-[20%] right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] mix-blend-multiply transition-opacity duration-300"
            style={{ transform: "translate(50%, -20%)" }}
          />
          <div
            className="absolute top-[60%] left-1/3 w-[600px] h-[600px] rounded-full bg-teal-400/8 blur-[130px] mix-blend-multiply transition-opacity duration-300"
            style={{ transform: "translate(-30%, -20%)" }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[120px] mix-blend-multiply transition-opacity duration-300"
            style={{ transform: "translate(30%, 30%)" }}
          />
        </>
      )}

      {/* Subtle clean professional grid background */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isDark ? "opacity-[0.07]" : "opacity-[0.08]"
        }`}
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(25, 19, 20, 0.08) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(25, 19, 20, 0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Subtle radial overlay to fade out the grid edges */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.8)_90%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(248,250,252,0.8)_90%)]"
        }`}
      />
    </div>
  );
};
