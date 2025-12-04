import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Define animation directions for different routes
const routeAnimations = {
  '/': { direction: 'up' },
  '/create-trip': { direction: 'right' },
  '/trip-history': { direction: 'left' },
  '/globe': { direction: 'up' },
  '/compare': { direction: 'right' },
  '/offline': { direction: 'left' },
  '/weather': { direction: 'up' },
  '/social': { direction: 'right' },
  '/view-trip': { direction: 'left' },
  default: { direction: 'fade' }
};

const getAnimationProps = (direction) => {
  const distance = 50;
  
  switch (direction) {
    case 'left':
      return {
        initial: { opacity: 0, x: -distance },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: distance }
      };
    case 'right':
      return {
        initial: { opacity: 0, x: distance },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -distance }
      };
    case 'up':
      return {
        initial: { opacity: 0, y: -distance },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: distance }
      };
    case 'down':
      return {
        initial: { opacity: 0, y: distance },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -distance }
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
  }
};

const AnimatedRoutes = ({ children }) => {
  const location = useLocation();
  const currentRoute = Object.keys(routeAnimations).find(route => 
    location.pathname.startsWith(route)
  ) || 'default';
  
  const animationType = routeAnimations[currentRoute]?.direction || routeAnimations.default.direction;
  const animationProps = getAnimationProps(animationType);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...animationProps}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          duration: 0.3 
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;