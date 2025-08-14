import React, { useState, Children, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BookContext } from '../context/BookContext';
import './Book.css';

interface BookProps {
  children: React.ReactNode;
}

export interface BookRef {
  handleFlip: (page: number) => void;
}

const Book = forwardRef<BookRef, BookProps>(({ children }, ref) => {
  const logicalPages = Children.toArray(children);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flipLocked, setFlipLocked] = useState(false);
  // Track which physical page indices are actively flipping to boost their z-index
  const [flippingIndices, setFlippingIndices] = useState<number[]>([]);
  const animTimer = useRef<number | null>(null);
  const ANIMATION_MS = 1000; // matches CSS page flip transition

  const physicalPages = [];
  for (let i = 0; i < logicalPages.length; i += 2) {
    physicalPages.push({
      front: logicalPages[i],
      back: i + 1 < logicalPages.length ? logicalPages[i + 1] : null,
    });
  }
  const pageCount = physicalPages.length;

  const handleFlip = (page: number) => {
    if (page >= 0 && page <= pageCount && page !== currentPage) {
      // Determine which page indices will flip (range between current and target)
      const start = Math.min(currentPage, page);
      const end = Math.max(currentPage, page);
      const indices = Array.from({ length: end - start }, (_, i) => start + i);
      setFlippingIndices(indices);

      setIsAnimating(true);
      if (animTimer.current) window.clearTimeout(animTimer.current);
      animTimer.current = window.setTimeout(() => {
        setIsAnimating(false);
        setFlippingIndices([]);
      }, ANIMATION_MS + 50);
      setCurrentPage(page);
    }
  };

  useImperativeHandle(ref, () => ({
    handleFlip,
  }));

  useEffect(() => {
    return () => {
      if (animTimer.current) window.clearTimeout(animTimer.current);
    };
  }, []);

  return (
    <BookContext.Provider value={{ handleFlip, flipLocked, setFlipLocked }}>
      <div className="book-container">
        <div id="book" className={`book ${isAnimating ? 'animating' : ''}`}>
          {physicalPages.map((page, index) => {
            const isFlipped = index < currentPage;
            // Base z-index keeps unflipped pages stacked correctly
            let zIndex = isFlipped ? index : pageCount - 1 - index;
            // Ensure actively flipping pages sit on top of neighbors during animation
            if (isAnimating && flippingIndices.includes(index)) {
              zIndex = pageCount + index; // boost above all
            }
            return (
              <div
                key={index}
                className={`page ${isFlipped ? 'flipped' : ''}`}
                style={{ zIndex }}
                onClick={() => {
                  if (flipLocked) return;
                  handleFlip(isFlipped ? index : index + 1);
                }}
              >
                <div className="page-content front">{page.front}</div>
                <div className="page-content back">{page.back}</div>
              </div>
            );
          })}
        </div>
      </div>
    </BookContext.Provider>
  );
});

export default Book;
