import React, { useRef, useEffect } from 'react';

const FlightVisualization = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Animation variables
    let animationFrameId;
    const particles = [];
    
    // Create initial particles (airplanes)
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2,
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    // Draw airplane shape
    const drawAirplane = (x, y, size, angle, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      
      // Airplane body
      ctx.fillStyle = '#3B82F6'; // Blue color
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 2, -size);
      ctx.lineTo(-size * 2, size);
      ctx.closePath();
      ctx.fill();
      
      // Wings
      ctx.fillStyle = '#60A5FA'; // Lighter blue
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(-size * 3, -size * 1.5);
      ctx.lineTo(-size * 3, size * 1.5);
      ctx.closePath();
      ctx.fill();
      
      // Tail
      ctx.fillStyle = '#93C5FD'; // Even lighter blue
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size, -size * 0.8);
      ctx.lineTo(size * 1.5, 0);
      ctx.lineTo(size, size * 0.8);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };
    
    // Animation loop
    const animate = () => {
      // Clear canvas with a semi-transparent overlay for trail effect
      ctx.fillStyle = 'rgba(249, 250, 251, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        // Move particle
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        
        // Reset particle if it goes off screen
        if (particle.x < -50 || particle.x > canvas.width + 50 || 
            particle.y < -50 || particle.y > canvas.height + 50) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.angle = Math.random() * Math.PI * 2;
        }
        
        // Draw airplane
        drawAirplane(particle.x, particle.y, particle.size, particle.angle, particle.opacity);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Flight Booking</h3>
          <p className="text-gray-600">Find and book your next adventure</p>
        </div>
      </div>
    </div>
  );
};

export default FlightVisualization;