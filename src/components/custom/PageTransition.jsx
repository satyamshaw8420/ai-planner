import React from 'react';
import AnimatedRoutes from './AnimatedRoutes';

const PageTransition = ({ children }) => {
  return (
    <AnimatedRoutes>
      {children}
    </AnimatedRoutes>
  );
};

export default PageTransition;