import { motion } from "motion/react";
import type { Key, ReactNode } from "react";

type FloatingBadgeProps = {
  key?: Key;
  children: ReactNode;
  className?: string;
  delay?: number;
  align?: "left" | "right";
  tone?: "light" | "dark";
};

export function FloatingBadge({ children, className = "", delay = 0, align = "left", tone = "light" }: FloatingBadgeProps) {
  const toneClass =
    tone === "dark"
      ? "border-white/10 bg-[#151c35]/94 text-white shadow-[0_18px_38px_rgba(6,10,24,0.26)]"
      : "border-white/80 bg-white/92 text-[#152033] shadow-[0_16px_40px_rgba(31,41,55,0.14)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: "easeOut" }}
      className={`absolute z-20 max-w-[12rem] rounded-[8px] border px-3.5 py-2 text-xs font-extrabold backdrop-blur-xl ${toneClass} ${align === "right" ? "text-right" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
