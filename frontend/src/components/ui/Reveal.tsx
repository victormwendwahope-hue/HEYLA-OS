import { useRef, useState, useEffect, type ReactNode } from 'react';

type AnimationType = 'fade-in' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale-bounce' | 'blur-in';

interface RevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function Reveal({ children, animation = 'fade-in', delay = 0, duration = 0.5, className = '', once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? `${animation} ${duration}s ease-out ${delay}s forwards` : 'none',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
