import React, { useEffect, useRef } from 'react';

export const LusionCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  
  const mouseCoords = useRef({ x: 0, y: 0 });
  const springRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const hoveredRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Initially hide cursor elements
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    dot.style.transition = 'opacity 0.2s ease-in-out';
    ring.style.transition = 'opacity 0.2s ease-in-out, background-color 0.3s, border-color 0.3s';

    const onMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      visibleRef.current = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    // Spring interpolation loop for trailing ring
    let animationId: number;
    const updateCursor = () => {
      const targetX = mouseCoords.current.x;
      const targetY = mouseCoords.current.y;
      
      // Update Dot position immediately
      dot.style.transform = `translate3d(${targetX - 3}px, ${targetY - 3}px, 0)`;

      // Update Ring position with mass-spring-damper physics
      const spring = springRef.current;
      const stiffness = 0.12; // Spring tension
      const damping = 0.65;   // Resistance/Friction
      
      const dx = targetX - spring.x;
      const dy = targetY - spring.y;
      
      spring.vx = (spring.vx + dx * stiffness) * damping;
      spring.vy = (spring.vy + dy * stiffness) * damping;
      
      spring.x += spring.vx;
      spring.y += spring.vy;

      const hovered = hoveredRef.current;
      const ringSize = hovered ? 48 : 32;
      const offset = ringSize / 2;
      
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.transform = `translate3d(${spring.x - offset}px, ${spring.y - offset}px, 0)`;
      ring.style.borderColor = hovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.45)';
      ring.style.backgroundColor = hovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0)';

      animationId = requestAnimationFrame(updateCursor);
    };

    updateCursor();

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer');
        
      hoveredRef.current = !!isInteractive;
    };

    window.addEventListener('mouseover', handleMouseOver);

    // Add CSS class to body to hide default browser cursor
    document.body.classList.add('lusion-cursor-active');

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationId);
      document.body.classList.remove('lusion-cursor-active');
    };
  }, []);

  return (
    <>
      {/* Exact mouse point indicator */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />
      {/* Smooth trailing Lusion lag circle ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border border-white pointer-events-none z-[9998] mix-blend-difference"
      />
    </>
  );
};
