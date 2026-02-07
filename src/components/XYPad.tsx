import { useRef, useState, useCallback, useEffect } from 'react';
import './XYPad.css';

interface XYPadProps {
  x: number; // 0-1 (complexity: simple to complex)
  y: number; // 0-1 (dynamics: quiet to loud)
  onChange: (x: number, y: number) => void;
}

export function XYPad({ x, y, onChange }: XYPadProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!padRef.current) return;

      const rect = padRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newY = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));

      onChange(newX, newY);
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updatePosition(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, updatePosition]);

  return (
    <div className="xy-pad-container">
      <div className="xy-pad-label xy-pad-label-top">LOUD</div>
      <div className="xy-pad-row">
        <div className="xy-pad-label xy-pad-label-left">SIMPLE</div>
        <div
          ref={padRef}
          className={`xy-pad ${isDragging ? 'xy-pad-active' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="xy-pad-grid">
            <div className="xy-pad-line xy-pad-line-h" />
            <div className="xy-pad-line xy-pad-line-v" />
          </div>
          <div
            className="xy-pad-handle"
            style={{
              left: `${x * 100}%`,
              top: `${(1 - y) * 100}%`,
            }}
          />
        </div>
        <div className="xy-pad-label xy-pad-label-right">COMPLEX</div>
      </div>
      <div className="xy-pad-label xy-pad-label-bottom">QUIET</div>
    </div>
  );
}
