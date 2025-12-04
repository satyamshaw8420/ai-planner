import React from 'react';
import AnimatedRoutes from './AnimatedRoutes';

const PageTransition = ({ children }) => {
  return (
    <AnimatedRoutes>
      <div className="w-full h-full">
        {children}
      </div>
    </AnimatedRoutes>
  );
};

export default PageTransition;