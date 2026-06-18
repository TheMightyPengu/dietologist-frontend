"use client";

import { MouseEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type LeafBurstButtonProps = {
  text: string;
  href?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  buttonClassName?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
};

export default function LeafBurstButton({
  text,
  href,
  className = "",
  disabled = false,
  onClick: onClickProp,
  buttonClassName,
  size = "lg",
  type = "button",
}: LeafBurstButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setGlowPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onClickProp?.();
      if (href) {
        router.push(href);
      }
    }
  };

  const sizeClasses = {
    sm: "px-3 py-2 md:px-5 md:py-2.5 text-sm rounded-full",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3 text-lg rounded-2xl",
  };

  const defaultButtonClass = `relative inline-flex items-center justify-center ${sizeClasses[size]} font-medium transition-all duration-300 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"} ${className}`;

  const finalButtonClass = buttonClassName ? `relative inline-flex items-center justify-center overflow-hidden outline-none ${buttonClassName}` : defaultButtonClass;

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={finalButtonClass}
      style={
        !buttonClassName
          ? {
              backgroundColor: "rgb(var(--primary))",
              color: "#ffffff",
              boxShadow: isHovered
                ? "0 18px 40px rgba(126,199,148,0.24)"
                : "0 10px 28px rgba(16,24,40,0.16)",
            }
          : undefined
      }
    >
      <div
        className={`pointer-events-none absolute w-[240px] h-[240px] rounded-full opacity-70 transition-transform duration-500 ease-out -translate-x-1/2 -translate-y-1/2 ${isHovered ? "scale-100" : "scale-0"}`}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background:
            "radial-gradient(circle, rgba(126,199,148,0.85) 0%, rgba(126,199,148,0.22) 35%, transparent 70%)",
        }}
      />
      <span className="relative z-10">{text}</span>
    </button>
  );
}
