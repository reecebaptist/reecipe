import React, { useState, Children } from 'react';
import './Book.css';

interface BookProps {
  children: React.ReactNode;
}

const Book: React.FC<BookProps> = ({ children }) => {
  const pages = Children.toArray(children);
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = pages.length;

  const handleFlip = (page: number) => {
    if (page >= 0 && page < pageCount) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="book-container">
      <div id="book" className="book">
        {pages.map((page, index) => {
          if (index === pages.length - 1) {
            return null;
          }
          const isFlipped = index < currentPage;
          const zIndex = isFlipped ? index : pageCount - 1 - index;
          return (
            <div
              key={index}
              className={`page ${isFlipped ? 'flipped' : ''}`}
              style={{ zIndex }}
              onClick={() => handleFlip(isFlipped ? index : index + 1)}
            >
              <div className="page-content front">{pages[index]}</div>
              <div className="page-content back">
                {index + 1 < pageCount ? pages[index + 1] : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Book;
