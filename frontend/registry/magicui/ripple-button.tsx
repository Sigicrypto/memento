"use client";

import React, { MouseEvent, useState } from "react";
import { cn } from "@/lib/utils";

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: string;
  children?: React.ReactNode;
  className?: string;
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(
  (
    {
      className,
      children,
      rippleColor = "#ADD8E6",
      duration = "600ms",
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const [buttonRipples, setButtonRipples] = useState<
      Array<{ x: number; y: number; size: number; key: number }>
    >([]);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;
      const height = rect.height;
      const width = rect.width;
      const diameter = Math.max(width, height);

      setButtonRipples((prevRipples) => [
        ...prevRipples,
        {
          x: left - diameter / 2,
          y: top - diameter / 2,
          size: diameter,
          key: Date.now() + Math.random(),
        },
      ]);

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface px-5 py-2.5 text-center font-medium text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
        <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          {buttonRipples.map((ripple) => (
            <span
              key={ripple.key}
              className="absolute rounded-full opacity-40 animate-rippling pointer-events-none"
              style={{
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                top: `${ripple.y}px`,
                left: `${ripple.x}px`,
                backgroundColor: rippleColor,
                animationDuration: duration,
              }}
              onAnimationEnd={() => {
                setButtonRipples((prev) =>
                  prev.filter((r) => r.key !== ripple.key)
                );
              }}
            />
          ))}
        </span>
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export default RippleButton;
