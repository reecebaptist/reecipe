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
  const ITEMS_PER_PAGE = 15;
  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const pageRecipes = recipes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (pageRecipes.length === 0) {
    return <div className="page-content" />;
  }

  // Go directly to the requested logical page number without extra flips
  const handleContentClick = (pageNum: number) => {
    if (bookContext) {
      // Convert 1-based logical page number to physical page index
      const physicalPage = Math.floor((pageNum - 1) / 2 + 1);
      bookContext.handleFlip(physicalPage);
    }
  };

  // Flip to the dedicated "new recipe" spread at the end
  const handleAddNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLeftLogicalPage = pageOffset + recipes.length * 2; // left page of new spread
    const physicalPage = Math.floor((newLeftLogicalPage - 1) / 2 + 1);
    bookContext?.handleFlip(physicalPage);
  };

  const lastOverallIndex = recipes.length - 1;
  const showsLastRecipe =
    lastOverallIndex >= startIndex &&
    lastOverallIndex < startIndex + pageRecipes.length;

  return (
    <div className="page-content contents-page-layout">
      {pageNumber === 1 && <h1>Contents</h1>}
      <ul className="contents-list">
        {pageRecipes.map((recipe, index) => {
          const recipeIndex = startIndex + index;
          const pageNum = pageOffset + recipeIndex * 2;
          return (
            <li
              key={recipeIndex}
              onClick={(e) => {
                e.stopPropagation(); // prevent page container click from triggering an extra flip
                handleContentClick(pageNum);
              }}
            >
              <span>{recipe.title}</span>
              <span className="dot-leader"></span>
              <span className="page-num">{pageNum}</span>
            </li>
          );
        })}
      </ul>
      {showsLastRecipe && (
        <button className="btn add-recipe-btn" onClick={handleAddNew}>
          + Add new recipe
        </button>
      )}
    </div>
  );
};

export default ContentsPage;
