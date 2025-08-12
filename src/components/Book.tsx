import React, { useState, Children } from 'react';
import { BookContext } from '../context/BookContext';
import './Book.css';

interface BookProps {
  children: React.ReactNode;
}

const Book: React.FC<BookProps> = ({ children }) => {
  const logicalPages = Children.toArray(children);
  const [currentPage, setCurrentPage] = useState(0);

  const physicalPages = [];
  for (let i = 0; i < logicalPages.length; i += 2) {
    physicalPages.push({
      front: logicalPages[i],
      back: i + 1 < logicalPages.length ? logicalPages[i + 1] : null,
    });
  }
  const pageCount = physicalPages.length;

  const handleFlip = (page: number) => {
    if (page >= 0 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

  return (
    <BookContext.Provider value={{ handleFlip }}>
      <div className="book-container">
        <div id="book" className="book">
          {physicalPages.map((page, index) => {
            const isFlipped = index < currentPage;
            const zIndex = isFlipped ? index : pageCount - 1 - index;
            return (
              <div
                key={index}
                className={`page ${isFlipped ? 'flipped' : ''}`}
                style={{ zIndex }}
                onClick={() => handleFlip(isFlipped ? index : index + 1)}
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
};

export default Book;
