"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { motionTiming, useLowPower } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const lowPower = useLowPower();
  const isNavigation = previousPath.current !== pathname;

  useEffect(() => {
    previousPath.current = pathname;
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={isNavigation && lowPower === false ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: motionTiming.easing }}
    >
      {children}
    </motion.div>
  );
}