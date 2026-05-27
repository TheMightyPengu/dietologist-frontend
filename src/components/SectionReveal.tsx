"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: "easeOut" },
  },
}

export interface SectionRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function SectionReveal({ children, className, ...props }: SectionRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
