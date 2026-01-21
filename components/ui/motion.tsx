"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { forwardRef, ReactNode } from "react";

// 通用动画变体
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// 列表容器动画（用于 stagger 效果）
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// 列表项动画
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

// 默认过渡配置
export const defaultTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth feel
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

// FadeIn 组件
interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.4, direction = "up", ...props }, ref) => {
    const directionOffset = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

// ScaleIn 组件
interface ScaleInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springTransition, delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleIn.displayName = "ScaleIn";

// Stagger 列表容器
interface StaggerListProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const StaggerList = forwardRef<HTMLDivElement, StaggerListProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerList.displayName = "StaggerList";

// Stagger 列表项
interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div ref={ref} variants={staggerItem} {...props}>
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// 按钮点击动画 wrapper
interface TapScaleProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  scale?: number;
}

export const TapScale = forwardRef<HTMLDivElement, TapScaleProps>(
  ({ children, scale = 0.97, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileTap={{ scale }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
TapScale.displayName = "TapScale";

// 悬停上浮效果
interface HoverLiftProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  y?: number;
}

export const HoverLift = forwardRef<HTMLDivElement, HoverLiftProps>(
  ({ children, y = -2, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y, transition: { duration: 0.2 } }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverLift.displayName = "HoverLift";

// 页面过渡动画
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const pageTransition = {
  duration: 0.3,
  ease: "easeInOut",
};

// 导出 motion 和 AnimatePresence
export { motion, AnimatePresence } from "framer-motion";
