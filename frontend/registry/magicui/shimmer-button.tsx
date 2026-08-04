"use client";

import React, { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  /** Horizontal padding in pixels (default 24) */
  paddingX?: number;
  /** Vertical padding in pixels (default 8) */
  paddingY?: number;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      paddingX = 24,
      paddingY = 8,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
            paddingLeft: `${paddingX}px`,
            paddingRight: `${paddingX}px`,
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 inline-flex shrink-0 min-h-[38px] min-w-max cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/15 text-white [background:var(--bg)] [border-radius:var(--radius)] transform-gpu transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:pointer-events-none disabled:opacity-50 select-none",
          className
        )}

        ref={ref}
        {...props}
      >
        {/* spark container (outer perimeter glow) */}
        <div
          className={cn(
            "absolute inset-0 overflow-visible [container-type:size] pointer-events-none"
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [inset:0_auto_0_0] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)/2)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* backdrop (masks center content so shimmer only glows on border) */}
        <div
          className={cn(
            "absolute z-0 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)] pointer-events-none"
          )}
        />

        {/* Children content wrapper */}
        <span className="relative z-10 flex items-center justify-center gap-2.5 py-0.5 font-bold text-xs tracking-wide leading-none">
          {children}
        </span>

        {/* Inner shadow/highlight */}
        <div
          className={cn(
            "absolute inset-0 z-10 size-full pointer-events-none rounded-[inherit]",
            "shadow-[inset_0_-4px_8px_rgba(255,255,255,0.08)]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-4px_12px_rgba(255,255,255,0.15)]"
          )}
        />

      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;

