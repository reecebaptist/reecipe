import { createContext } from 'react';

interface BookContextType {
  handleFlip: (page: number) => void;
  flipLocked: boolean;
  setFlipLocked: (locked: boolean) => void;
}

export const BookContext = createContext<BookContextType | undefined>(
  undefined
);
