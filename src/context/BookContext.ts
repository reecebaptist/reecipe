import { createContext } from 'react';

interface BookContextType {
  handleFlip: (page: number) => void;
  flipLocked: boolean;
  setFlipLocked: (locked: boolean) => void;
  // Single page (portrait) mode state and controls
  singlePage: boolean;
  setSinglePage: (on: boolean) => void;
  // Navigate directly to a specific logical page index (0-based == index in pages array)
  goToLogicalPage: (logicalIndex: number) => void;
}

export const BookContext = createContext<BookContextType | undefined>(
  undefined
);
