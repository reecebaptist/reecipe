import React, { useContext } from 'react';
import { Recipe } from '../data';
import { BookContext } from '../context/BookContext';
import './styles.css';

interface ContentsPageProps {
  recipes: Recipe[];
  pageNumber: 1 | 2;
  pageOffset: number;
}

const ContentsPage: React.FC<ContentsPageProps> = ({
  recipes,
  pageNumber,
  pageOffset,
}) => {
  const bookContext = useContext(BookContext);
  const ITEMS_PER_PAGE = 25;
  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const pageRecipes = recipes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (pageRecipes.length === 0) {
    return <div className="page-content" />;
  }

  const handleContentClick = (pageNum: number) => {
    if (bookContext) {
      const physicalPage = Math.ceil(pageNum / 2);
      bookContext.handleFlip(physicalPage);
    }
  };

  return (
    <div className="page-content contents-page-layout">
      {pageNumber === 1 && <h1>Contents</h1>}
      <ul className="contents-list">
        {pageRecipes.map((recipe, index) => {
          const recipeIndex = startIndex + index;
          const pageNum = pageOffset + recipeIndex * 2;
          return (
            <li key={recipeIndex} onClick={() => handleContentClick(pageNum)}>
              <span>{recipe.title}</span>
              <span className="dot-leader"></span>
              <span className="page-num">{pageNum}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ContentsPage;
