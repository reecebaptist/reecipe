import { createContext } from 'react';

interface BookContextType {
  handleFlip: (page: number) => void;
}

export const BookContext = createContext<BookContextType | undefined>(
  undefined
);
