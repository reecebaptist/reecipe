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
  const [singlePage, setSinglePage] = useState(false);
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

  // Navigate directly to a logical page index (0-based over logicalPages)
  const goToLogicalPage = (logicalIndex: number) => {
    if (Number.isNaN(logicalIndex)) return;
    if (singlePage) {
      // In single page mode, show that exact logical page index
      // Clamp to bounds
      const clamped = Math.max(0, Math.min(logicalPages.length - 1, logicalIndex));
      setCurrentPage(clamped);
      return;
    }
    // Convert logical index to 1-based page number then to physical spread index
    const pageNum = logicalIndex + 1; // 1-based logical
    const physicalPage = Math.floor((pageNum - 1) / 2 + 1);
    handleFlip(physicalPage);
  };

  const handleFlip = (page: number) => {
    if (singlePage) {
      // In single page mode, interpret incoming physical spread index as a request to show its left logical page
      const logicalIndex = Math.max(0, Math.min(logicalPages.length - 1, page * 2));
      setCurrentPage(logicalIndex);
      return;
    }
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

  // Keep current page sensible when switching modes
  useEffect(() => {
    if (singlePage) {
      // physical spread index -> logical index (left page of the spread)
      setCurrentPage((prev) => {
        const logicalIndex = Math.max(0, Math.min(logicalPages.length - 1, prev * 2));
        return logicalIndex;
      });
    } else {
      // logical index -> physical spread index
      setCurrentPage((prev) => {
        const physicalIndex = Math.max(0, Math.min(pageCount, Math.floor(prev / 2)));
        return physicalIndex;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singlePage]);

  return (
    <BookContext.Provider value={{ handleFlip, flipLocked, setFlipLocked, singlePage, setSinglePage, goToLogicalPage }}>
      {singlePage ? (
        <div className="book-container-portrait">
          <div
            className="page-portrait"
            onClick={(e) => {
              if (flipLocked) return;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              const goNext = x > rect.width / 2;
              setCurrentPage((prev) => {
                if (goNext) return Math.min(prev + 1, logicalPages.length - 1);
                return Math.max(prev - 1, 0);
              });
            }}
            role="button"
            aria-label="Single page: click left to go back, right to go forward"
          >
            {/* currentPage is logical index in single page mode */}
            {logicalPages[currentPage]}
          </div>
        </div>
      ) : (
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
      )}
    </BookContext.Provider>
  );
});

export default Book;
