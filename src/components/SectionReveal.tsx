import type { CSSProperties, HTMLAttributes, ReactNode } from "react"

type SectionRevealStyle = CSSProperties & {
  "--section-reveal-delay"?: string
}

export interface SectionRevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  disabled?: boolean
}

export function SectionReveal({
  children,
  className = "",
  style,
  delay = 0,
  disabled = false,
  ...props
}: SectionRevealProps) {
  const revealStyle: SectionRevealStyle = {
    "--section-reveal-delay": `${delay}ms`,
    ...style,
  }

  return (
    <div
      className={`${disabled ? "" : "section-reveal"} ${className}`}
      style={revealStyle}
      {...props}
    >
      {children}
    </div>
  )
}







// "use client"

// import { motion, useReducedMotion } from "framer-motion"
// import type { HTMLMotionProps, Variants } from "framer-motion"
// import type { ReactNode } from "react"

// const sectionVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 18,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.38,
//       ease: [0.22, 1, 0.36, 1],
//     },
//   },
// }

// export interface SectionRevealProps extends HTMLMotionProps<"div"> {
//   children: ReactNode
// }

// export function SectionReveal({
//   children,
//   className,
//   ...props
// }: SectionRevealProps) {
//   const shouldReduceMotion = useReducedMotion()

//   return (
//     <motion.div
//       initial={shouldReduceMotion ? false : "hidden"}
//       whileInView={shouldReduceMotion ? undefined : "visible"}
//       viewport={
//         shouldReduceMotion
//           ? undefined
//           : {
//               once: true,
//               amount: 0.05,
//               margin: "0px 0px -120px 0px",
//             }
//       }
//       variants={shouldReduceMotion ? undefined : sectionVariants}
//       className={className}
//       style={{
//         willChange: shouldReduceMotion ? "auto" : "opacity, transform",
//         ...props.style,
//       }}
//       {...props}
//     >
//       {children}
//     </motion.div>
//   )
// }