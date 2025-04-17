import React, { useEffect, useRef } from 'react';

export default function MessageLoader() {
  const dotRefs = [useRef(null), useRef(null), useRef(null)];
  
  useEffect(() => {
    // Create animations for each dot
    const animateDot = (dotRef: any, delay:any) => {
      if (!dotRef.current) return;
      
      // Create and configure the animation
      const animation = dotRef.current.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.4)' },
          { transform: 'scale(1)' }
        ],
        {
          duration: 600,
          delay,
          iterations: Infinity,
          easing: 'ease-in-out'
        }
      );
      
      return animation;
    };
    
    // Start animations with staggered delays
    const animations = [
      animateDot(dotRefs[0], 0),
      animateDot(dotRefs[1], 150),
      animateDot(dotRefs[2], 300)
    ];
    
    // Cleanup
    return () => {
      animations.forEach(anim => anim?.cancel());
    };
  }, []);
  
  return (
    <div>
      <div className="bg-gray-200 rounded-3xl w-[70px] py-2 flex flex-row items-center justify-center max-w-16">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={dotRefs[i]}
            className="w-[8px] h-[8px] bg-gray-400 rounded-full mx-1"
          />
        ))}
      </div>
    </div>
  );
}