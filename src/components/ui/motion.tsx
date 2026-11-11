"use client";

import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade + rise when scrolled into view. Use for below-the-fold content only. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "p";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/**
 * Masked word-by-word rise. Text stays in the DOM as one readable string for assistive tech.
 * `immediate` animates on mount (for heroes) instead of on scroll.
 */
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const anim = (i: number) =>
    reduce
      ? {}
      : {
          initial: { y: "105%" },
          ...(immediate
            ? { animate: { y: "0%" } }
            : { whileInView: { y: "0%" }, viewport: { once: true, margin: "0px 0px -10% 0px" } }),
          transition: { duration: 1, ease: EASE, delay: delay + i * stagger },
        };
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-top -mb-[0.08em]">
            <motion.span className="inline-block will-change-transform" {...anim(i)}>
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Counts up to `to` when scrolled into view. The final number is server-rendered for no-JS and SEO. */
export function CountUp({ to, duration = 1.6, className }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {to}
    </span>
  );
}

/** Scales a block up from slightly inset as it scrolls into place. */
export function ScrollGrow({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { scale }} className={className}>
      {children}
    </motion.div>
  );
}

function ScrollWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/** Paragraph whose words light up as it scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <ScrollWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </p>
  );
}
