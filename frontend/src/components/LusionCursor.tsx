import React, { useEffect, useRef, useState } from 'react';

export const LusionCursor: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  
  const mouseCoords = useRef({ x: 0, y: 0 });
  const springRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    // Show cursor only when mouse moves
    const onMouseMove = (e: MouseEvent) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    // Spring interpolation loop for trailing ring
    let animationId: number;
    const updateCursor = () => {
      const targetX = mouseCoords.current.x;
      const targetY = mouseCoords.current.y;
      
      // Update Dot position immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX - 3}px, ${targetY - 3}px, 0)`;
      }

      // Update Ring position with mass-spring-damper physics (liquid momentum)
      const spring = springRef.current;
      const stiffness = 0.12; // Spring tension
      const damping = 0.65;   // Resistance/Friction
      
      const dx = targetX - spring.x;
      const dy = targetY - spring.y;
      
      spring.vx = (spring.vx + dx * stiffness) * damping;
      spring.vy = (spring.vy + dy * stiffness) * damping;
      
      spring.x += spring.vx;
      spring.y += spring.vy;

      if (ringRef.current) {
        const ringSize = hovered ? 48 : 32;
        const offset = ringSize / 2;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        ringRef.current.style.transform = `translate3d(${spring.x - offset}px, ${spring.y - offset}px, 0)`;
      }

      animationId = requestAnimationFrame(updateCursor);
    };

    updateCursor();

    // Attach hover listeners to all interactive items on the page
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer')
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
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
  }, [hovered, visible]);

  if (!visible) return null;

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
        className="fixed top-0 left-0 rounded-full border border-white pointer-events-none z-[9998] mix-blend-difference transition-[background-color,border-color] duration-300"
        style={{
          borderColor: hovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.45)',
          backgroundColor: hovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0)',
        }}
      />
    </>
  );
};
