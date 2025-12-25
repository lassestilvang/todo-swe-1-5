"use client";

import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { ReactNode } from "react";

// Animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInFromLeft = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

export const slideInFromRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

export const slideInFromTop = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

export const slideInFromBottom = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

// Transition presets
export const transitions = {
  smooth: { duration: 0.3, ease: "easeInOut" as const },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 30 },
  slow: { duration: 0.5, ease: "easeInOut" as const },
  fast: { duration: 0.15, ease: "easeInOut" as const },
};

// Animated components
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionCard = motion.div;

// Page transition wrapper
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      transition={transitions.smooth}
    >
      {children}
    </motion.div>
  );
}

// List item animation
export function ListItem({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ ...transitions.smooth, delay }}
    >
      {children}
    </motion.div>
  );
}

// Sidebar animation
export function SidebarAnimation({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={slideInFromLeft}
          transition={transitions.bouncy}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Modal animation
export function ModalAnimation({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={scaleIn}
          transition={transitions.bouncy}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hover animation wrapper
export function HoverScale({ children, scale = 1.05 }: { children: ReactNode; scale?: number }) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={transitions.fast}
    >
      {children}
    </motion.div>
  );
}

// Task card animation
export function TaskCardAnimation({ children, index }: { children: ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ ...transitions.smooth, delay: index * 0.05 }}
      layout
    >
      {children}
    </motion.div>
  );
}

// Floating animation
export function Floating({ children, amplitude = 10, duration = 3 }: { 
  children: ReactNode; 
  amplitude?: number; 
  duration?: number; 
}) {
  return (
    <motion.div
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation
export function Pulse({ children, scale = 1.05, duration = 2 }: { 
  children: ReactNode; 
  scale?: number; 
  duration?: number; 
}) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
