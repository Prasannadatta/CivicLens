import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const PAGE_MOTION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const REDUCED_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Shared page enter/exit transition for main content only.
 * Header, footer, and side nav stay outside this wrapper.
 */
export default function PageTransition({ viewKey, children }) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion ? REDUCED_MOTION : PAGE_MOTION;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={motionProps.initial}
        animate={motionProps.animate}
        exit={motionProps.exit}
        transition={{ duration: reduceMotion ? 0.2 : 0.32, ease: 'easeOut' }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
